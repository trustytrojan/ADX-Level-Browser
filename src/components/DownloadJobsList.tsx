import { Text, View, FlatList } from 'react-native';
import type { DownloadJobItem } from '../types';
import { styles } from '../styles/AppStyles';
import { SongElement } from './SongElement';

interface DownloadJobsListProps {
  downloadJobs: DownloadJobItem[];
}

export const DownloadJobsList = ({ downloadJobs }: DownloadJobsListProps) => {
  if (downloadJobs.length === 0) {
    return null;
  }

  return (
    <>
      <Text style={styles.sectionLabel}>Current Downloads</Text>
      <View style={styles.downloadsContainer}>
        <FlatList
          style={styles.downloadsList}
          data={downloadJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongElement
              item={item}
              downloading={item.status === 'IN_PROGRESS'}
            />
          )}
        />
      </View>
    </>
  );
};
