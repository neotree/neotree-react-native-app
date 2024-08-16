import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type ViewQRCodeProps ={
  value: any,
  logo?: any
}

export function QRcodeView({value,logo}:ViewQRCodeProps){
  return ( <View>
    <QRCode
      value={value}
      size={80}
      logo={logo}
      logoSize={20}
    />
  </View>)
}