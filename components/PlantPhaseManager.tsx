import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PlantPhase, PlantStage } from '../types/plant';

interface PlantPhaseManagerProps {
  currentStage: PlantStage;
  phases: PlantPhase[];
  onPhaseChange: (newStage: PlantStage, startDate: Date, notes?: string) => void;
  onPhaseUpdate: (phaseIndex: number, updates: Partial<PlantPhase>) => void;
}

export const PlantPhaseManager: React.FC<PlantPhaseManagerProps> = ({
  currentStage,
  phases,
  onPhaseChange,
  onPhaseUpdate,
}) => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null);
  const [newNotes, setNewNotes] = useState('');

  const stageOrder: PlantStage[] = [
    'прорастание',
    'рассада',
    'вегетация',
    'цветение',
    'урожай готов!'
  ];

  const getNextStages = (): PlantStage[] => {
    const currentIndex = stageOrder.indexOf(currentStage);
    return stageOrder.slice(currentIndex + 1);
  };

  const handleStageChange = (newStage: PlantStage) => {
    const startDate = new Date();
    onPhaseChange(newStage, startDate);
    setShowDatePicker(false);
  };

  const handleAddNotes = (phaseIndex: number) => {
    if (newNotes.trim()) {
      onPhaseUpdate(phaseIndex, { notes: newNotes.trim() });
      setNewNotes('');
      setEditingPhaseIndex(null);
    }
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString('ru-RU');
    const end = endDate ? new Date(endDate).toLocaleDateString('ru-RU') : 'по настоящее время';
    return `${start} - ${end}`;
  };

  const getStageColor = (stage: PlantStage) => {
    switch (stage) {
      case 'прорастание': return '#FF9500';
      case 'рассада': return '#34C759';
      case 'вегетация': return '#5856D6';
      case 'цветение': return '#FF2D55';
      case 'урожай готов!': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Управление фазами роста</Text>
      {/* История фаз */}
      <View style={styles.phasesHistory}>
        <Text style={styles.historyTitle}>Текущая фаза</Text>
        {phases.map((phase, index) => (
          <View key={index} style={styles.phaseItem}>
            <TouchableOpacity
              style={styles.phaseHeader}
              onPress={() => setExpandedPhase(expandedPhase === index ? null : index)}
            >
              <View style={styles.phaseInfo}>
                <View style={[styles.phaseStage, { backgroundColor: getStageColor(phase.stage) }]}>
                  <Text style={styles.phaseStageText}>{phase.stage}</Text>
                </View>
                <Text style={styles.phaseDates}>
                  {formatDateRange(phase.startDate, phase.endDate)}
                </Text>
              </View>
              <Ionicons
                name={expandedPhase === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {expandedPhase === index && (
              <View style={styles.phaseDetails}>
                {phase.notes ? (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Заметки:</Text>
                    <Text style={styles.notesText}>{phase.notes}</Text>
                    <TouchableOpacity
                      style={styles.editNotesButton}
                      onPress={() => {
                        setEditingPhaseIndex(index);
                        setNewNotes(phase.notes || '');
                      }}
                    >
                      <Ionicons name="create-outline" size={16} color="#007AFF" />
                      <Text style={styles.editNotesText}>Редактировать</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addNotesButton}
                    onPress={() => setEditingPhaseIndex(index)}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#007AFF" />
                    <Text style={styles.addNotesText}>Добавить заметки</Text>
                  </TouchableOpacity>
                )}

                {editingPhaseIndex === index && (
                  <View style={styles.notesEditor}>
                    <TextInput
                      style={styles.notesInput}
                      value={newNotes}
                      onChangeText={setNewNotes}
                      placeholder="Добавьте заметки об этой фазе..."
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.notesActions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingPhaseIndex(null);
                          setNewNotes('');
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Отмена</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleAddNotes(index)}
                      >
                        <Text style={styles.saveButtonText}>Сохранить</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
      {/* Текущая фаза */}
      {/* <View style={styles.currentPhase}>
        <Text style={styles.currentPhaseLabel}>Текущая фаза:</Text>
        <View style={[styles.stageBadge, { backgroundColor: getStageColor(currentStage) + '20' }]}>
          <View style={[styles.stageDot, { backgroundColor: getStageColor(currentStage) }]} />
          <Text style={[styles.stageText, { color: getStageColor(currentStage) }]}>
            {currentStage}
          </Text>
        </View>
      </View> */}

      {/* Кнопки для перехода на следующую фазу */}
      {getNextStages().length > 0 && (
        <View style={styles.nextStages}>
          <Text style={styles.nextStagesLabel}>Перейти к следующей фазе:</Text>
          {getNextStages().map((stage) => (
            <TouchableOpacity
              key={stage}
              style={[styles.stageButton, { borderColor: getStageColor(stage) }]}
              onPress={() => handleStageChange(stage)}
            >
              <Text style={[styles.stageButtonText, { color: getStageColor(stage) }]}>
                {stage}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  currentPhase: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPhaseLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    color: '#333',
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextStages: {
    marginBottom: 16,
  },
  nextStagesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  stageButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  stageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  phasesHistory: {
    marginTop: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  phaseItem: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8F9FA',
  },
  phaseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseStage: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  phaseStageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  phaseDates: {
    fontSize: 12,
    color: '#666',
  },
  phaseDetails: {
    padding: 12,
    backgroundColor: 'white',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  editNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editNotesText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  addNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  addNotesText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  notesEditor: {
    marginTop: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#6C757D',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#28A745',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});