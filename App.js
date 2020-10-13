// @refresh reset
import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, TextInput, Button, View, YellowBox } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAt1tcfw-07rm_RMz6vqFNxGf8lVTvbY_s",
  authDomain: "expo-react-app.firebaseapp.com",
  databaseURL: "https://expo-react-app.firebaseio.com",
  projectId: "expo-react-app",
  storageBucket: "expo-react-app.appspot.com",
  messagingSenderId: "1034830025420",
  appId: "1:1034830025420:web:390e9ae44a664c7af76869"
};

if(firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig)
}

YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot.docChanges().filter(({type}) => type === 'added').map(({doc}) => {
        const message = doc.data()
        return {...message, createdAt: message.createdAt.toDate() }
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
    })

    return () => unsubscribe()
  }, []);

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser(){
    const user = await AsyncStorage.getItem('user');
    if(user) {
      setUser(JSON.parse(user))
    }
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7)
    const user = {_id, name}
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }

  if(!user) {
    return (<View style={styles.container}>
      <TextInput style={styles.input} placeholder="Enter Your name" value={name} onChangeText={setName} />
      <Button onPress={handlePress} title="Enter To Chat" />
    </View>)
  }

  return (
      <GiftedChat messages={messages} user={user} onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  input: {
    height:50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    borderColor: 'grey',
    marginBottom: 20,
  },

    
});
