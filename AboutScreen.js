import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function AboutScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');

    const handleSubmit = () => {
        if (!name || !email || !message || !subject) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }
        Alert.alert('Success', 'Your inquiry has been submitted!');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
    };

    return (
        <View style={styles.infoContainer}>
            <Text>NavEye Assist 1.0.0 by Kazi Rafee</Text>
            <Text style={styles.infoText}>This app helps visually impaired users navigate by announcing alleged objects using the camera.</Text>
            <Text style={styles.warning}>Note: This app in no way is a substitute of appropiate vision equipments</Text>
            <Text>Issues or Suggestions? Please let us know by filling the form</Text>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Subject:</Text>
                    <TextInput
                        style={styles.input}
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="Enter Subject"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Message:</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Enter your message"
                        multiline
                    />
                </View>
                <View style={styles.button}>
                    <Button title="Submit" onPress={handleSubmit} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
      flex: 1,
      justifyContent: 'flex-start', 
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    infoText: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
    },
    warning: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
      },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      width: '30%', // Adjust as needed
      textAlign: 'right',
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 40,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      backgroundColor: '#fff', // White background for inputs
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    button: {
      marginTop: 20,
      width: '100%',
    },
  });
  