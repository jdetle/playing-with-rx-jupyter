import React, { Component } from 'react';
import '../../static/App.css';
import Content from './content';

class App extends Component {
  render() {
      return(<div>
        <pre>Version: {this.props.version}</pre>
        {
          this.props.kernels && this.props.kernels.length > 0 ? (
            <div>
            <h2>Kernels</h2>
              { this.props.kernels.map(kernel =>
                <pre key={kernel.id}>{kernel.id}</pre>
              )}
            </div>
          ) : null
        }
        {
          this.props.contents ? (
            <div>
            <h2>Content!</h2>
            <Content contents={this.props.contents} />
            </div>
          ) : null
        }
      </div>)
  }
}

export default App;
