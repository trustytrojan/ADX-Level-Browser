import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles';

interface ModalSongElementProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  downloaded?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  variant: 'review' | 'downloading';
}

export const ModalSongElement = ({
  title,
  subtitle,
  leftIcon,
  downloaded = false,
  showRemoveButton = false,
  onRemove,
  variant,
}: ModalSongElementProps) => {
  const itemStyle = variant === 'review' ? styles.reviewModalItem : styles.downloadingModalItem;
  const contentStyle = variant === 'review' ? styles.reviewModalItemContent : styles.downloadingModalItemContent;
  const titleStyle = variant === 'review' ? styles.reviewModalItemTitle : styles.downloadingModalItemTitle;
  const subtitleStyle = variant === 'review' ? styles.reviewModalItemSubtitle : styles.downloadingModalItemSubtitle;
  const leftContainerStyle = variant === 'downloading' ? styles.downloadingModalItemLeft : null;

  return (
    <View style={itemStyle}>
      {leftIcon && leftContainerStyle && <View style={leftContainerStyle}>{leftIcon}</View>}
      <View style={contentStyle}>
        <Text style={titleStyle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={subtitleStyle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {downloaded && (
        <MaterialCommunityIcons
          name='check-circle'
          size={20}
          color='#4caf50'
          style={{ marginRight: 8 }}
        />
      )}
      {showRemoveButton && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={12}
          style={styles.reviewModalItemRemove}
        >
          <MaterialCommunityIcons name='close' size={20} color='#ff6b6b' />
        </TouchableOpacity>
      )}
    </View>
  );
};
