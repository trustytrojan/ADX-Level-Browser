import { TextInput, View } from 'react-native';
import { styles } from '../styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
}

export const SearchBar = ({ value, onChangeText, onSubmitEditing }: SearchBarProps) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder='Search...'
        placeholderTextColor='#9aa3b2'
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType='search'
      />
    </View>
  );
};
