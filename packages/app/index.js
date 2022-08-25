import { registerRootComponent } from "expo";

import App from "./app";

global.Buffer = global.Buffer || require("buffer").Buffer;

registerRootComponent(App);
