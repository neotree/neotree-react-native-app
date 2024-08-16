import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type ViewQRCodeProps ={
  value: any,
}

export function QRcodeView({value}:ViewQRCodeProps){

  return ( <View>
    <QRCode
      value={value}
      size={40}
    />
  </View>)
}