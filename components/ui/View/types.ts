import { ViewProps as RNViewProps } from 'react-native';

export type ViewProps = RNViewProps & {
    /** 
     * marginLeft 
     */
    ml?: number;
    /** 
     * marginRight 
     */
    mr?: number;
    /** 
     * marginTop 
     */
    mt?: number;
    /** 
     * marginBottom 
     */
    mb?: number;
    /** 
     * marginVertical 
     */
    mv?: number;
    /** 
     * marginHorizontal 
     */
    mh?: number;
    /** 
     * paddingLeft 
     */
    pl?: number;
    /** 
     * paddingRight 
     */
    pr?: number;
    /** 
     * paddingTop 
     */
    pt?: number;
    /** 
     * paddingBottom 
     */
    pb?: number;
    /** 
     * paddingVertical 
     */
    pv?: number;
    /** 
     * paddingHorizontal 
     */
    ph?: number;
};
