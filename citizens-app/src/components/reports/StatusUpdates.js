import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import reportService from '../../services/reportService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const StatusUpdates = ({ reportId }) => {
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatusUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const updates = await reportService.getStatusUpdates(reportId);
      setStatusUpdates(updates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchStatusUpdates();
    }
  }, [reportId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusUpdate = ({ item, index }) => (
    <View style={styles.updateContainer}>
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, index === 0 && styles.latestDot]} />
        {index < statusUpdates.length - 1 && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.updateContent}>
        <Text style={styles.updateText}>{item.update_text}</Text>
        <View style={styles.updateMeta}>
          <Text style={styles.updateAuthor}>
            {item.created_by_user?.name || 'Municipal Official'}
          </Text>
          <Text style={styles.updateDate}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading status updates..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={fetchStatusUpdates}
        retryText="Retry"
      />
    );
  }

  if (statusUpdates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="information-circle-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No status updates yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status Updates</Text>
      <FlatList
        data={statusUpdates}
        renderItem={renderStatusUpdate}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  updateContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  latestDot: {
    backgroundColor: '#2196F3',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginTop: 8,
  },
  updateContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  updateText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  updateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateAuthor: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
});

export default StatusUpdates;