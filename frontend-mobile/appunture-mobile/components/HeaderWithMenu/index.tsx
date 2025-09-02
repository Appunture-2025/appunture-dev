import React, { useState } from 'react';
import { Header, DrawerMenu } from '../index';

export const HeaderWithMenu: React.FC = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  return (
    <>
      <Header onMenuPress={handleMenuPress} />
      <DrawerMenu 
        visible={isMenuVisible} 
        onClose={handleMenuClose} 
      />
    </>
  );
};
