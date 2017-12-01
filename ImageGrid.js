import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

function ImageGrid(props) {
  const {objects} = props;

  return (
    <View style={styles.container}>
    {
      objects.items.map((artist, i) => {
        if (artist !== null) {
          return (
            <Image
              style={{width: 100, height: 100}}
              key={i}
              source={ artist.images.map( (image) => {
                return {
                  uri: image.url,
                  width:image.width,
                  height:image.height
                }
              })} />
          );
        }
      })
    }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

ImageGrid.propTypes = {
};

export default ImageGrid;
