export type RootStackParamList = {
  welcome: undefined;
  login: undefined;
  register: undefined;
  "point-details": { id: string };
  "body-map": undefined;
  "(tabs)": undefined;
};

export type TabParamList = {
  index: undefined;
  search: undefined;
  chatbot: undefined;
  favorites: undefined;
  profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
