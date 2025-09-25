import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusUpdates from '../../components/reports/StatusUpdates';
import { useReport } from '../../hooks/useReports';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '../../config/api';

const ReportDetailScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const { report, loading, error, fetchReport, upvoteReport, removeUpvote } = useReport(reportId);
  const [upvoting, setUpvoting] = useState(false);

  const category = REPORT_CATEGORIES.find(cat => cat.value === report?.category);
  const status = REPORT_STATUSES.find(stat => stat.value === report?.status);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      if (report.user_upvoted) {
        await removeUpvote();
      } else {
        await upvoteReport();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpvoting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading report details..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={fetchReport}
        retryText="Retry"
      />
    );
  }

  if (!report) {
    return (
      <ErrorMessage 
        message="Report not found" 
        onRetry={() => navigation.goBack()}
        retryText="Go Back"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.reportHeader}>
          <View style={styles.categoryContainer}>
            <Ionicons 
              name={category?.icon || 'help-circle'} 
              size={20} 
              color="#2196F3" 
            />
            <Text style={styles.category}>{category?.label || 'Other'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status?.color || '#666' }]}>
            <Text style={styles.statusText}>{status?.label || report.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{report.title}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{report.address}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{formatDate(report.created_at)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.metaText}>
              {report.created_by_user?.name || 'Anonymous'}
            </Text>
          </View>
        </View>

        {report.photo_url && (
          <Image source={{ uri: report.photo_url }} style={styles.photo} />
        )}

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{report.description}</Text>
        </View>

        <View style={styles.upvoteContainer}>
          <TouchableOpacity
            style={[styles.upvoteButton, report.user_upvoted && styles.upvotedButton]}
            onPress={handleUpvote}
            disabled={upvoting}
          >
            <Ionicons
              name={report.user_upvoted ? 'heart' : 'heart-outline'}
              size={20}
              color={report.user_upvoted ? '#fff' : '#F44336'}
            />
            <Text style={[
              styles.upvoteText,
              report.user_upvoted && styles.upvotedText
            ]}>
              {report.user_upvoted ? 'Upvoted' : 'Upvote'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.upvoteCount}>
            {report.upvote_count || 0} {(report.upvote_count || 0) === 1 ? 'upvote' : 'upvotes'}
          </Text>
        </View>

        <StatusUpdates reportId={reportId} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 32,
  },
  metaContainer: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#fff',
  },
  upvotedButton: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  upvoteText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  upvotedText: {
    color: '#fff',
  },
  upvoteCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default ReportDetailScreen;