import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '../../config/api';

const ReportCard = ({ report, onPress, showUpvote = false, onUpvote }) => {
  const category = REPORT_CATEGORIES.find(cat => cat.value === report.category);
  const status = REPORT_STATUSES.find(stat => stat.value === report.status);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (onUpvote) {
      onUpvote(report.id);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(report)}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Ionicons 
            name={category?.icon || 'help-circle'} 
            size={16} 
            color="#2196F3" 
          />
          <Text style={styles.category}>{category?.label || 'Other'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status?.color || '#666' }]}>
          <Text style={styles.statusText}>{status?.label || report.status}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {report.title}
      </Text>

      <Text style={styles.description} numberOfLines={3}>
        {report.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {report.address}
          </Text>
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={styles.date}>{formatDate(report.created_at)}</Text>
          
          {showUpvote && (
            <TouchableOpacity 
              style={styles.upvoteButton} 
              onPress={handleUpvote}
            >
              <Ionicons 
                name={report.user_upvoted ? 'heart' : 'heart-outline'} 
                size={16} 
                color={report.user_upvoted ? '#F44336' : '#666'} 
              />
              <Text style={styles.upvoteCount}>{report.upvote_count || 0}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upvoteCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default ReportCard;