import React, { Component } from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import ParticlesBg from 'particles-bg';
// import Clarifai from 'clarifai';
import 'tachyons';

// const app = new Clarifai.App({
//   apiKey: '5508fee4403d458cb50fb36a241fce7a',
// });
    
      // const returnClarifaiRequestOptions = (imageUrl) => {   
      // const PAT = 'f8a47e9130fd40d989ce2a7bbc2c2718';
      // const USER_ID = 'akram02april';       
      // const APP_ID = 'test';
      // // const MODEL_ID = 'face-detection';
      // // const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';    
      // const IMAGE_URL = imageUrl;


      // const raw = JSON.stringify({
      //     "user_app_id": {
      //         "user_id": USER_ID,
      //         "app_id": APP_ID
      //     },
      //     "inputs": [
      //         {
      //             "data": {
      //                 "image": {
      //                     "url": IMAGE_URL
      //                 }
      //             }
      //         }
      //     ]
      // });

      //   const requestOptions = {
      //     method: 'POST',
      //     headers: {
      //         'Accept': 'application/json',
      //         'Authorization': 'Key ' + PAT
      //     },
      //     body: raw
      // };

      // return requestOptions;

      // }

const intialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
  }

class App extends Component {
  constructor() {
    super();
    this.state = intialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col*width,
        topRow: clarifaiFace.top_row*height,
        rightCol: width - (clarifaiFace.right_col*width),
        bottomRow: height - (clarifaiFace.bottom_row*height)
      }
  }



  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }


    onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});

    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(result => {
        const parsedData = JSON.parse(result);
        if(parsedData.status.description === "Ok"){
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log)

          this.displayFaceBox(this.calculateFaceLocation(parsedData))
        } else {
          throw new Error("Invalid Image URL");
        }
        })
      .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(intialState);
    }else if (route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }


  render() {
    return (
    <div className="App">
      <ParticlesBg type="cobweb" num={200} bg={true} color="#FFFFFF" /> 
      <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
      { this.state.route === 'home' 
        ? <div> 
            <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
          </div>
          : ( this.state.route === 'signin' 
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          ) 
        }
    </div>
  );
}
}

export default App;
