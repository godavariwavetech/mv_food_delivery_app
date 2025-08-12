// screens/DeleteAccountScreen.js
import React, { useContext,useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { AuthContext } from "../context/AuthContext";
import ApiService from '../services/apiservice';


const DeleteAccountScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);

    useEffect(()=>{
        console.log(user?.id, 'user');
    },[])

    const handleDelete = async () => {
        console.log('deleted');
        try {
            // setLoader(true)
            const resp = await ApiService.deleteAccount(user?.id);
            console.log(resp, 'delete response')
            console.log(resp?.status === 200)
            if (resp?.status === 200) {
                Alert.alert('Account deleted successfully');
                navigation.navigate('MainApp');
            } else {
                Alert.alert("Error", response?.message || "Failed to fetch Profile.");
            }
        } catch (error) {
            Alert.alert("Error", error.message || "Something went wrong.");
        }
    }

    const handleDeleteAccount = () => {

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel', },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        handleDelete()
                        // TODO: Add your API call here
                        // Example: await api.delete('/user/account');
                        // Alert.alert('Account deleted successfully');
                        // navigation.navigate('Home');
                    },
                },
            ],
        );
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20, fontSize: 16 }}>Delete your account permanently</Text>
            <Button title="Delete Account" color="red" onPress={handleDeleteAccount} />
        </View>
    );
};

export default DeleteAccountScreen;
