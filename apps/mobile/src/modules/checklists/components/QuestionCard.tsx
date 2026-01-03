/**
 * Gapp Mobile - QuestionCard Component
 * 
 * Componente para exibir uma pergunta do checklist com opções Sim/Não.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardContent, Badge } from '../../../components/ui';
import { ChecklistQuestion, ChecklistAnswer } from '../types/checklist.types';

interface QuestionCardProps {
  question: ChecklistQuestion;
  answer: ChecklistAnswer | undefined;
  questionNumber: number;
  totalQuestions: number;
  error?: string;
  onAnswer: (answer: boolean) => void;
  onObservationChange: (observation: string) => void;
  onPhotoAdd?: () => void;
  photoCount?: number;
}

export function QuestionCard({
  question,
  answer,
  questionNumber,
  totalQuestions,
  error,
  onAnswer,
  onObservationChange,
  onPhotoAdd,
  photoCount = 0,
}: QuestionCardProps) {
  const colors = useThemeColors();
  
  const isAnswered = answer?.answer !== null && answer?.answer !== undefined;
  const isYes = answer?.answer === true;
  const isNo = answer?.answer === false;
  const showObservation = isNo && question.requiresObservationOnNo;

  return (
    <Card style={[styles.card, error && styles.cardError]}>
      <CardContent>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.questionMeta}>
            <Text style={[styles.questionNumber, { color: colors.mutedForeground }]}>
              Pergunta {questionNumber} de {totalQuestions}
            </Text>
            {question.isRequired && (
              <Badge variant="destructive" style={styles.requiredBadge}>
                Obrigatória
              </Badge>
            )}
          </View>
        </View>

        {/* Pergunta */}
        <Text style={[styles.questionText, { color: colors.foreground }]}>
          {question.questionText}
        </Text>

        {/* Botões Sim/Não */}
        <View style={styles.answersContainer}>
          <TouchableOpacity
            style={[
              styles.answerButton,
              styles.yesButton,
              isYes && styles.yesButtonActive,
              { borderColor: isYes ? themeColors.success : colors.border },
            ]}
            onPress={() => onAnswer(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isYes ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={28}
              color={isYes ? themeColors.success : colors.mutedForeground}
            />
            <Text
              style={[
                styles.answerText,
                { color: isYes ? themeColors.success : colors.mutedForeground },
                isYes && styles.answerTextActive,
              ]}
            >
              Sim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.answerButton,
              styles.noButton,
              isNo && styles.noButtonActive,
              { borderColor: isNo ? themeColors.destructive : colors.border },
            ]}
            onPress={() => onAnswer(false)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isNo ? 'close-circle' : 'close-circle-outline'}
              size={28}
              color={isNo ? themeColors.destructive : colors.mutedForeground}
            />
            <Text
              style={[
                styles.answerText,
                { color: isNo ? themeColors.destructive : colors.mutedForeground },
                isNo && styles.answerTextActive,
              ]}
            >
              Não
            </Text>
          </TouchableOpacity>
        </View>

        {/* Observação obrigatória */}
        {showObservation && (
          <View style={styles.observationContainer}>
            <View style={styles.observationHeader}>
              <Text style={[styles.observationLabel, { color: colors.foreground }]}>
                Observação
              </Text>
              <Badge variant="warning">Obrigatória</Badge>
            </View>
            <TextInput
              style={[
                styles.observationInput,
                {
                  backgroundColor: colors.input,
                  color: colors.foreground,
                  borderColor: error ? themeColors.destructive : colors.border,
                },
              ]}
              placeholder="Descreva o problema encontrado..."
              placeholderTextColor={colors.mutedForeground}
              value={answer?.observation || ''}
              onChangeText={onObservationChange}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Campo de observação opcional */}
        {isAnswered && !showObservation && (
          <View style={styles.observationContainer}>
            <Text style={[styles.observationLabel, { color: colors.mutedForeground }]}>
              Observação (opcional)
            </Text>
            <TextInput
              style={[
                styles.observationInput,
                styles.observationInputSmall,
                {
                  backgroundColor: colors.input,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Adicione uma observação..."
              placeholderTextColor={colors.mutedForeground}
              value={answer?.observation || ''}
              onChangeText={onObservationChange}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Botão de foto */}
        {isAnswered && onPhotoAdd && (
          <TouchableOpacity
            style={[styles.photoButton, { borderColor: colors.border }]}
            onPress={onPhotoAdd}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color={themeColors.primary.DEFAULT} />
            <Text style={[styles.photoButtonText, { color: themeColors.primary.DEFAULT }]}>
              {photoCount > 0 ? `${photoCount} foto(s) anexada(s)` : 'Adicionar foto'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={themeColors.destructive} />
            <Text style={[styles.errorText, { color: themeColors.destructive }]}>
              {error}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  cardError: {
    borderWidth: 1,
    borderColor: themeColors.destructive,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  questionNumber: {
    fontSize: typography.sizes.sm,
  },
  requiredBadge: {
    marginLeft: spacing[2],
  },
  questionText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium as '500',
    lineHeight: 26,
    marginBottom: spacing[4],
  },
  answersContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    borderRadius: 12,
    borderWidth: 2,
    gap: spacing[2],
  },
  yesButton: {
    backgroundColor: 'transparent',
  },
  yesButtonActive: {
    backgroundColor: themeColors.success + '15',
  },
  noButton: {
    backgroundColor: 'transparent',
  },
  noButtonActive: {
    backgroundColor: themeColors.destructive + '15',
  },
  answerText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium as '500',
  },
  answerTextActive: {
    fontWeight: typography.weights.bold as '700',
  },
  observationContainer: {
    marginTop: spacing[4],
  },
  observationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  observationLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  observationInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    fontSize: typography.sizes.base,
    minHeight: 100,
  },
  observationInputSmall: {
    minHeight: 60,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: spacing[2],
  },
  photoButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    gap: spacing[1],
  },
  errorText: {
    fontSize: typography.sizes.sm,
  },
});

