import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import './style.css';
import App from "./components/App";

window.registerExtension('refactoring/architecture', options => {

    const {el} = options;

    render(
        <App
            project={options.component}
        />, el
    );

    return () => unmountComponentAtNode(el);
});
