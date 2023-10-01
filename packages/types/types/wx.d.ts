export interface WxProj {
    root: string;
    appid: string;
}
export interface WxAppWindowJSON {
    navigationBarBackgroundColor?: string;
    navigationBarTitleText?: string;
    navigationBarTextStyle?: string;
    backgroundTextStyle?: string;
    backgroundColor?: string;
    [key: string]: unknown;
}
export interface WxAppUsingJSON {
    [key: string]: string;
}
export interface WxAppTabBarList extends Array<{
    text: string;
    pagePath: string;
    selectedIcon?: string;
    unselectedIcon?: string;
}> {
}
export interface WxAppTabBar {
    custom?: boolean;
    list: WxAppTabBarList;
}
export interface WxAppJSON {
    pages: string[];
    tabBar?: WxAppTabBar;
    window?: WxAppWindowJSON;
    usingComponents?: WxAppUsingJSON;
}
