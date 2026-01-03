/**
 * Gapp Mobile - Checklist Execution Screen
 * 
 * Tela de execução de um checklist de abertura.
 * Implementa:
 * - Seleção de unidade (se aplicável)
 * - Carregamento de template por unidade
 * - Responder perguntas Sim/Não com validação
 * - Salvar rascunho automaticamente
 * - Finalizar e enviar execução
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardContent, Button, Loading, EmptyState } from '../../../components/ui';
import { logger } from '../../../lib/observability';

import { useChecklistExecution } from '../hooks/useChecklistExecution';
import { useUnitSelection } from '../hooks/useUnitSelection';
import { 
  UnitSelector, 
  QuestionCard, 
  ChecklistProgress, 
  ChecklistSummary 
} from '../components';

type Props = ChecklistsStackScreenProps<'ChecklistExecution'>;

type ExecutionStep = 'unit_selection' | 'execution' | 'summary' | 'success';

export function ChecklistExecutionScreen({ route, navigation }: Props) {
  const { checklistId, executionId } = route.params;
  const colors = useThemeColors();
  
  const [step, setStep] = useState<ExecutionStep>('unit_selection');
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Hooks
  const unitSelection = useUnitSelection();
  const execution = useChecklistExecution(unitSelection.selectedUnitId || '');

  // Log mount
  useEffect(() => {
    logger.info('ChecklistExecutionScreen mounted', { 
      checklistId, 
      executionId,
      selectedUnitId: unitSelection.selectedUnitId,
    });
  }, [checklistId, executionId, unitSelection.selectedUnitId]);

  // Carrega template quando unidade é selecionada
  useEffect(() => {
    if (unitSelection.selectedUnitId && step === 'unit_selection') {
      execution.loadTemplate();
    }
  }, [unitSelection.selectedUnitId, step]);

  // Carrega rascunho quando template é carregado
  useEffect(() => {
    if (execution.template && !execution.loading) {
      execution.loadDraft();
    }
  }, [execution.template, execution.loading]);

  // Animação de transição entre perguntas
  const animateTransition = useCallback((callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  }, [fadeAnim]);

  // Handlers
  const handleStartExecution = useCallback(() => {
    if (!unitSelection.selectedUnitId) {
      Alert.alert('Atenção', 'Selecione uma unidade para continuar.');
      return;
    }
    setStep('execution');
  }, [unitSelection.selectedUnitId]);

  const handleAnswer = useCallback((questionId: string, answer: boolean) => {
    execution.setAnswer(questionId, answer);
  }, [execution]);

  const handleObservationChange = useCallback((questionId: string, observation: string) => {
    execution.setObservation(questionId, observation);
  }, [execution]);

  const handleNextQuestion = useCallback(() => {
    if (execution.currentQuestionIndex < execution.questions.length - 1) {
      animateTransition(() => {
        execution.goToNextQuestion();
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      });
    } else {
      // Última pergunta - ir para resumo
      setStep('summary');
    }
  }, [execution, animateTransition]);

  const handlePreviousQuestion = useCallback(() => {
    if (execution.currentQuestionIndex > 0) {
      animateTransition(() => {
        execution.goToPreviousQuestion();
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      });
    }
  }, [execution, animateTransition]);

  const handleGoToSummary = useCallback(() => {
    // Valida antes de ir para resumo
    if (!execution.validate()) {
      Alert.alert(
        'Perguntas Pendentes',
        'Existem perguntas obrigatórias não respondidas ou observações faltando. Deseja continuar mesmo assim?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => setStep('summary') },
        ]
      );
      return;
    }
    setStep('summary');
  }, [execution]);

  const handleBackFromSummary = useCallback(() => {
    setStep('execution');
  }, []);

  const handleSubmit = useCallback(async () => {
    const result = await execution.submit();
    if (result) {
      setStep('success');
    }
  }, [execution]);

  const handleFinish = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDiscardDraft = useCallback(() => {
    Alert.alert(
      'Descartar Rascunho',
      'Tem certeza que deseja descartar o progresso salvo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Descartar', 
          style: 'destructive',
          onPress: () => execution.discardDraft(),
        },
      ]
    );
  }, [execution]);

  // Render: Loading
  if (unitSelection.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading size="large" text="Carregando..." />
      </SafeAreaView>
    );
  }

  // Render: Step - Seleção de Unidade
  if (step === 'unit_selection') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              📋 Checklist de Abertura
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Selecione a unidade para iniciar
            </Text>
          </View>

          {/* Seletor de Unidade */}
          <UnitSelector
            units={unitSelection.availableUnits}
            selectedUnit={unitSelection.selectedUnit}
            onSelect={(unit) => unitSelection.selectUnit(unit.id)}
            canSelect={unitSelection.canSelectUnit}
            label="Unidade"
          />

          {/* Info do template (se carregado) */}
          {execution.template && (
            <Card style={styles.templateCard}>
              <CardContent>
                <View style={styles.templateInfo}>
                  <Ionicons 
                    name="document-text-outline" 
                    size={24} 
                    color={themeColors.primary.DEFAULT} 
                  />
                  <View style={styles.templateText}>
                    <Text style={[styles.templateName, { color: colors.foreground }]}>
                      {execution.template.name}
                    </Text>
                    {execution.template.description && (
                      <Text style={[styles.templateDesc, { color: colors.mutedForeground }]}>
                        {execution.template.description}
                      </Text>
                    )}
                    <Text style={[styles.templateQuestions, { color: colors.mutedForeground }]}>
                      {execution.questions.length} perguntas
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Rascunho existente */}
          {execution.hasDraft && (
            <Card style={[styles.draftCard, { borderColor: themeColors.warning }]}>
              <CardContent>
                <View style={styles.draftInfo}>
                  <Ionicons name="save-outline" size={24} color={themeColors.warning} />
                  <View style={styles.draftText}>
                    <Text style={[styles.draftTitle, { color: colors.foreground }]}>
                      Rascunho Salvo
                    </Text>
                    <Text style={[styles.draftDesc, { color: colors.mutedForeground }]}>
                      {Object.keys(execution.answers).length} respostas salvas
                    </Text>
                  </View>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onPress={handleDiscardDraft}
                  >
                    Descartar
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Loading do template */}
          {execution.loading && (
            <View style={styles.loadingContainer}>
              <Loading size="small" text="Carregando template..." />
            </View>
          )}

          {/* Erro */}
          {execution.error && (
            <Card style={[styles.errorCard, { borderColor: themeColors.destructive }]}>
              <CardContent>
                <View style={styles.errorContent}>
                  <Ionicons name="alert-circle" size={24} color={themeColors.destructive} />
                  <Text style={[styles.errorText, { color: themeColors.destructive }]}>
                    {execution.error.message}
                  </Text>
                </View>
                <Button 
                  variant="outline" 
                  onPress={() => execution.loadTemplate()}
                  style={styles.retryButton}
                >
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Botão Iniciar */}
          <Button
            variant="default"
            onPress={handleStartExecution}
            disabled={!unitSelection.selectedUnitId || !execution.template || execution.loading}
            style={styles.startButton}
          >
            {execution.hasDraft ? 'Continuar Checklist' : 'Iniciar Checklist'}
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render: Step - Execução
  if (step === 'execution') {
    const currentQuestion = execution.questions[execution.currentQuestionIndex];
    const currentAnswer = currentQuestion ? execution.answers[currentQuestion.id] : undefined;
    const isLastQuestion = execution.currentQuestionIndex === execution.questions.length - 1;
    const canGoNext = currentAnswer?.answer !== null && currentAnswer?.answer !== undefined;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Progresso */}
          <ChecklistProgress
            questions={execution.questions}
            answers={execution.answers}
            currentIndex={execution.currentQuestionIndex}
            onQuestionPress={(index) => {
              animateTransition(() => {
                execution.goToQuestion(index);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              });
            }}
          />

          {/* Pergunta atual */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.questionContent}
            keyboardShouldPersistTaps="handled"
          >
            {currentQuestion && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <QuestionCard
                  question={currentQuestion}
                  answer={currentAnswer}
                  questionNumber={execution.currentQuestionIndex + 1}
                  totalQuestions={execution.questions.length}
                  error={execution.validationErrors[currentQuestion.id]}
                  onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                  onObservationChange={(obs) => handleObservationChange(currentQuestion.id, obs)}
                />
              </Animated.View>
            )}
          </ScrollView>

          {/* Navegação */}
          <View style={[styles.navigation, { backgroundColor: colors.background }]}>
            <Button
              variant="outline"
              onPress={handlePreviousQuestion}
              disabled={execution.currentQuestionIndex === 0}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={20} color={colors.foreground} />
              <Text>Anterior</Text>
            </Button>

            <Button
              variant="ghost"
              onPress={handleGoToSummary}
              style={styles.summaryButton}
            >
              Resumo
            </Button>

            <Button
              variant="default"
              onPress={handleNextQuestion}
              style={styles.navButton}
            >
              <Text style={{ color: 'white' }}>
                {isLastQuestion ? 'Revisar' : 'Próxima'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Render: Step - Resumo
  if (step === 'summary') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ChecklistSummary
          templateName={execution.template?.name || 'Checklist'}
          unitName={unitSelection.selectedUnit?.name || ''}
          questions={execution.questions}
          answers={execution.answers}
          generalObservations={execution.generalObservations}
          onObservationsChange={execution.setGeneralObservations}
          onSubmit={handleSubmit}
          onBack={handleBackFromSummary}
          isSubmitting={execution.submitting}
          isValid={execution.isValid}
        />
      </SafeAreaView>
    );
  }

  // Render: Step - Sucesso
  if (step === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={themeColors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Checklist Enviado!
          </Text>
          <Text style={[styles.successMessage, { color: colors.mutedForeground }]}>
            A execução foi registrada com sucesso.
          </Text>
          
          {execution.execution?.hasNonConformities && (
            <Card style={[styles.nonConformityAlert, { borderColor: themeColors.warning }]}>
              <CardContent>
                <View style={styles.alertContent}>
                  <Ionicons name="warning" size={24} color={themeColors.warning} />
                  <Text style={[styles.alertText, { color: colors.foreground }]}>
                    Foram identificadas não-conformidades nesta execução.
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

          <Button
            variant="default"
            onPress={handleFinish}
            style={styles.finishButton}
          >
            Concluir
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  templateCard: {
    marginBottom: spacing[4],
  },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  templateText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  templateName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
  },
  templateDesc: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  templateQuestions: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[2],
  },
  draftCard: {
    marginBottom: spacing[4],
    borderWidth: 1,
  },
  draftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  draftTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as '600',
  },
  draftDesc: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  loadingContainer: {
    paddingVertical: spacing[6],
  },
  errorCard: {
    marginBottom: spacing[4],
    borderWidth: 1,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  retryButton: {
    marginTop: spacing[3],
  },
  startButton: {
    marginTop: spacing[4],
  },
  questionContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  summaryButton: {},
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  successIcon: {
    marginBottom: spacing[4],
  },
  successTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: typography.sizes.base,
    textAlign: 'center',
    marginTop: spacing[2],
  },
  nonConformityAlert: {
    marginTop: spacing[6],
    borderWidth: 1,
    width: '100%',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  alertText: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  finishButton: {
    marginTop: spacing[6],
    minWidth: 200,
  },
});
