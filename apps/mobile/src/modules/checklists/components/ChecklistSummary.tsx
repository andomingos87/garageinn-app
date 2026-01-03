/**
 * Gapp Mobile - ChecklistSummary Component
 * 
 * Componente para exibir o resumo antes de finalizar o checklist.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../../components/ui';
import { ChecklistQuestion, ChecklistAnswer } from '../types/checklist.types';

interface ChecklistSummaryProps {
  templateName: string;
  unitName: string;
  questions: ChecklistQuestion[];
  answers: Record<string, ChecklistAnswer>;
  generalObservations: string;
  onObservationsChange: (text: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export function ChecklistSummary({
  templateName,
  unitName,
  questions,
  answers,
  generalObservations,
  onObservationsChange,
  onSubmit,
  onBack,
  isSubmitting,
  isValid,
}: ChecklistSummaryProps) {
  const colors = useThemeColors();

  // Contadores
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => {
    const answer = answers[q.id];
    return answer?.answer !== null && answer?.answer !== undefined;
  }).length;
  const yesCount = questions.filter(q => answers[q.id]?.answer === true).length;
  const noCount = questions.filter(q => answers[q.id]?.answer === false).length;
  const conformityPercent = totalQuestions > 0 
    ? Math.round((yesCount / totalQuestions) * 100) 
    : 0;

  // Não-conformidades
  const nonConformities = questions.filter(q => answers[q.id]?.answer === false);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Resumo do Checklist
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Revise as respostas antes de finalizar
        </Text>
      </View>

      {/* Info do checklist */}
      <Card style={styles.infoCard}>
        <CardContent>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={20} color={themeColors.primary.DEFAULT} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              {templateName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color={themeColors.primary.DEFAULT} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              {unitName}
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card style={styles.statsCard}>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.primary.DEFAULT }]}>
                {answeredQuestions}/{totalQuestions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Respondidas
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.success }]}>
                {yesCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Conforme
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.destructive }]}>
                {noCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Não-conforme
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text 
                style={[
                  styles.statValue, 
                  { 
                    color: conformityPercent >= 80 
                      ? themeColors.success 
                      : conformityPercent >= 50 
                        ? themeColors.warning 
                        : themeColors.destructive,
                  },
                ]}
              >
                {conformityPercent}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Conformidade
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Não-conformidades */}
      {nonConformities.length > 0 && (
        <Card style={styles.nonConformitiesCard}>
          <CardHeader>
            <View style={styles.nonConformitiesHeader}>
              <CardTitle>Não-conformidades</CardTitle>
              <Badge variant="destructive">{nonConformities.length}</Badge>
            </View>
          </CardHeader>
          <CardContent>
            {nonConformities.map((question, index) => {
              const answer = answers[question.id];
              return (
                <View 
                  key={question.id} 
                  style={[
                    styles.nonConformityItem,
                    index < nonConformities.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.nonConformityIcon}>
                    <Ionicons name="alert-circle" size={20} color={themeColors.destructive} />
                  </View>
                  <View style={styles.nonConformityContent}>
                    <Text style={[styles.nonConformityText, { color: colors.foreground }]}>
                      {question.questionText}
                    </Text>
                    {answer?.observation && (
                      <Text style={[styles.nonConformityObs, { color: colors.mutedForeground }]}>
                        Obs: {answer.observation}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Observações gerais */}
      <Card style={styles.observationsCard}>
        <CardHeader>
          <CardTitle>Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <TextInput
            style={[
              styles.observationsInput,
              {
                backgroundColor: colors.input,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Adicione observações gerais sobre a execução..."
            placeholderTextColor={colors.mutedForeground}
            value={generalObservations}
            onChangeText={onObservationsChange}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </CardContent>
      </Card>

      {/* Botões */}
      <View style={styles.buttons}>
        <Button
          variant="outline"
          onPress={onBack}
          style={styles.backButton}
          disabled={isSubmitting}
        >
          Voltar e Revisar
        </Button>
        
        <Button
          variant="default"
          onPress={onSubmit}
          style={styles.submitButton}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Finalizar Checklist'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  infoCard: {
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  infoText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  statsCard: {
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  nonConformitiesCard: {
    marginBottom: spacing[4],
  },
  nonConformitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nonConformityItem: {
    flexDirection: 'row',
    paddingVertical: spacing[3],
  },
  nonConformityIcon: {
    marginRight: spacing[3],
    paddingTop: 2,
  },
  nonConformityContent: {
    flex: 1,
  },
  nonConformityText: {
    fontSize: typography.sizes.base,
  },
  nonConformityObs: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    marginTop: spacing[1],
  },
  observationsCard: {
    marginBottom: spacing[6],
  },
  observationsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    fontSize: typography.sizes.base,
    minHeight: 100,
  },
  buttons: {
    gap: spacing[3],
  },
  backButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

