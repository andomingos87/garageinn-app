/**
 * Gapp Mobile - ChecklistProgress Component
 * 
 * Componente para exibir o progresso do checklist.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { ChecklistQuestion, ChecklistAnswer } from '../types/checklist.types';

interface ChecklistProgressProps {
  questions: ChecklistQuestion[];
  answers: Record<string, ChecklistAnswer>;
  currentIndex: number;
  onQuestionPress: (index: number) => void;
}

export function ChecklistProgress({
  questions,
  answers,
  currentIndex,
  onQuestionPress,
}: ChecklistProgressProps) {
  const colors = useThemeColors();

  const answeredCount = questions.filter(q => {
    const answer = answers[q.id];
    return answer?.answer !== null && answer?.answer !== undefined;
  }).length;

  const progressPercent = questions.length > 0 
    ? Math.round((answeredCount / questions.length) * 100) 
    : 0;

  const getQuestionStatus = (question: ChecklistQuestion): 'answered' | 'current' | 'unanswered' | 'error' => {
    const index = questions.indexOf(question);
    const answer = answers[question.id];
    const isAnswered = answer?.answer !== null && answer?.answer !== undefined;
    const isNo = answer?.answer === false;
    const needsObservation = question.requiresObservationOnNo && isNo;
    const hasObservation = !!answer?.observation?.trim();

    if (index === currentIndex) return 'current';
    if (isAnswered) {
      if (needsObservation && !hasObservation) return 'error';
      return 'answered';
    }
    if (question.isRequired) return 'unanswered';
    return 'unanswered';
  };

  return (
    <View style={styles.container}>
      {/* Barra de progresso */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercent}%`,
                backgroundColor: themeColors.primary.DEFAULT,
              },
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {answeredCount}/{questions.length} ({progressPercent}%)
        </Text>
      </View>

      {/* Indicadores de perguntas */}
      <View style={styles.dotsContainer}>
        {questions.map((question, index) => {
          const status = getQuestionStatus(question);
          
          return (
            <TouchableOpacity
              key={question.id}
              style={[
                styles.dot,
                status === 'current' && [styles.dotCurrent, { borderColor: themeColors.primary.DEFAULT }],
                status === 'answered' && [styles.dotAnswered, { backgroundColor: themeColors.success }],
                status === 'error' && [styles.dotError, { backgroundColor: themeColors.destructive }],
                status === 'unanswered' && { backgroundColor: colors.muted },
              ]}
              onPress={() => onQuestionPress(index)}
              activeOpacity={0.7}
            >
              {status === 'answered' && (
                <Ionicons name="checkmark" size={10} color="white" />
              )}
              {status === 'error' && (
                <Ionicons name="alert" size={10} color="white" />
              )}
              {status === 'current' && (
                <View style={[styles.dotCurrentInner, { backgroundColor: themeColors.primary.DEFAULT }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
    minWidth: 70,
    textAlign: 'right',
  },
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCurrent: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  dotCurrentInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAnswered: {},
  dotError: {},
});

