import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

function ImageGrid(props) {
  const {objects , dimensions: {width, height}, slider} = props;
  const tileSize = width < height ? width/slider : width/slider;
  // console.log (`dimensions: ${width} x ${height}, titleSize: ${tileSize}`);

  return (
    <View style={styles.container}>
    {
      objects.items.map((item, i) => {
        if (item.hasOwnProperty('images')) {
          return (
            <Image
              style={{width: tileSize, height: tileSize}}
              key={i}
              source={ item.images.map( (image) => {
                return {
                  uri: image.url,
                  width:image.width,
                  height:image.height
                }
              })} />
          );
        } else if (item.hasOwnProperty('album')) {
          return (
            <Image
              style={{width: tileSize, height: tileSize}}
              key={i}
              source={ item.album.images.map( (image) => {
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
  objects: PropTypes.object.isRequired,
  dimensions: PropTypes.object.isRequired,
  slider: PropTypes.number.isRequired,
};

export default ImageGrid;
