import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ApiService from '../services/apiservice';
import { Alert } from 'react-native';
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', password: '' });
  const [touched, setTouched] = useState({ mobileNumber: false, password: false });
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (number) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!number) return 'Phone number is required';
    if (number.length !== 10) return 'Phone number must be 10 digits';
    if (!indianPhoneRegex.test(number)) return 'Invalid number. Must start with 6, 7, 8, or 9';
    return '';
  };

  const validatePassword = (pass) => {
    if (!pass) return 'Password is required';
    if (pass.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleMobileChange = (text) => {
    setMobileNumber(text);
    if (touched.mobileNumber) {
      setErrors((prevErrors) => ({ ...prevErrors, mobileNumber: validatePhoneNumber(text) }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (touched.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: validatePassword(text) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: field === 'mobileNumber' ? validatePhoneNumber(mobileNumber) : validatePassword(password),
    }));
  };

  const isButtonEnabled =
    mobileNumber.length === 10 &&
    password.length >= 6 &&
    !errors.mobileNumber &&
    !errors.password;

  const handleLogin = async () => {
    console.log("ENTERD INTo login")
    if (isButtonEnabled) {
      setLoading(true);
      try {
        const response = await ApiService.login(mobileNumber, password);
        console.log("response>>>>>>>>>>>>>>>>>",response)
        if (response.status === 200 && response.data.length > 0) {
          console.log('Login Success:', response);
          login(response.data[0]);
          navigation.replace('MainApp');
        } else {
          Alert.alert("Error", "Invalid credentials");
        }
      } catch (error) {
        console.error('Login Error:', error);
        Alert.alert('Login Failed', error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/login.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.mobileNumber && touched.mobileNumber && styles.inputError]}
          placeholder="Mobile Number"
          placeholderTextColor="gray"
          keyboardType="phone-pad"
          value={mobileNumber}
          maxLength={10}
          onChangeText={handleMobileChange}
          onBlur={() => handleBlur('mobileNumber')}
        />
        {touched.mobileNumber && errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}

        <TextInput
          style={[styles.input, errors.password && touched.password && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="gray"
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => handleBlur('password')}
        />
        {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.loginButton, !isButtonEnabled && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!isButtonEnabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginText}>Log In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(20),
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: verticalScale(30),
    borderRadius: 10,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: verticalScale(45),
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: verticalScale(10),
    fontSize: scale(14),
    color: '#000',
  },
  inputError: {
    borderBottomColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: scale(12),
    marginBottom: verticalScale(10),
  },
  loginButton: {
    width: '100%',
    backgroundColor: 'green',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
});

export default LoginScreen;
