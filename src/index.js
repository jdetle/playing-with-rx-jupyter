import React from 'react';
import ReactDOM from 'react-dom';
import '../static/index.css';
import App from './components/App';
const Rx = require('rxjs/Rx');
global.Rx = Rx;

import { ajax } from 'rxjs/observable/dom/ajax';

global.ajax = ajax;
global.Observable = Rx.Observable;

const uuid = require('uuid');

const session = uuid.v4();

export function createMessage(msg_type, fields) {
  const username = 'hokey';
  return Object.assign({
    header: {
      username,
      session,
      msg_type,
      msg_id: uuid.v4(),
      date: new Date(),
      version: '5.0',
    },
    metadata: {},
    parent_header: {},
    content: {},
  }, fields);
}


export function createExecuteRequest(code) {
  const executeRequest = createMessage('execute_request');
  executeRequest.content = {
    code,
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false,
  };
  executeRequest.msg_type = executeRequest.header.msg_type;
  executeRequest.msg_id = executeRequest.header.msg_id;
  executeRequest.channel = 'shell';
  executeRequest.buffers = [] ;
  return executeRequest;
}

window.createExecuteRequest = createExecuteRequest;

window.createMessage = createMessage;

const jupyter = require('rx-jupyter');

const serverConfig = {
  endpoint: "http://127.0.0.1:8888",
  crossDomain: true,
};

window.jupyter = jupyter;
window.serverConfig = serverConfig;

// If using `npm link rx-jupyter`, the Observable and the one imported here do
// not match, which means we don't have all the operators we want
// To get around this, we wrap the Observables by creating a new Observable
// const wrap = Rx.Observable.from;

const version = jupyter.apiVersion(serverConfig);

export const poll = (obs, interval) => {
  const mappedObs = Rx.Observable.from(obs)
    .catch((err) => {
      if (err.xhr) {
        return Rx.Observable.of(err.xhr);
      }
      throw err;
    })

  return Rx.Observable.merge(
    // Fire off the first API Call
    mappedObs,
    // Poll on an interval
    Rx.Observable.interval(interval)
                 .mergeMap(() => mappedObs)
  )
}

const kernel$ = poll(jupyter.kernels.list(serverConfig), 2000);
const content$ = poll(jupyter.contents.get(serverConfig, ""), 2000);

const state$ = Rx.Observable.combineLatest(version, kernel$, content$,
  (version, kernels, contents) => ({ version: version.response.version, kernels: kernels.response, contents: contents.response }));

const root = document.getElementById('root');

state$
  .subscribe(({ version, kernels, contents }) => {
    ReactDOM.render(<App version={version} kernels={kernels} contents={contents} />, root);
  },
  (err) => {
    console.error(err);
    ReactDOM.render(<code>{err.toString()}</code>, root);
  }
)
