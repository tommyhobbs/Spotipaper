import React from 'react';
import { View, TouchableHighlight, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

function ImageGrid(props) {
  const {
    objects,
    dimensions: {
      width,
      height,
    },
    slider,
    onClick,
  } = props;
  const tileSize = width < height ? width/slider : width/slider;

  return (
    <TouchableHighlight onPress={onClick}>
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
    </TouchableHighlight>
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
  onClick: PropTypes.func,
};

export default ImageGrid;
