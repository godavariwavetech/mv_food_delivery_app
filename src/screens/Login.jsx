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
  StatusBar,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ApiService from '../services/apiservice';
import { Alert } from 'react-native';
import { AuthContext } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', password: '' });
  const [touched, setTouched] = useState({ mobileNumber: false, password: false });
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);



  const validatePhoneNumber = (number) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!number) return 'Phone number is required';
    if (number.length !== 10) return 'Phone number must be 10 digits';
    if (!indianPhoneRegex.test(number)) return 'Invalid number. Must start with 6, 7, 8, or 9';
    return '';
  };

  const validatePassword = (pass) => {
    if (!pass) return 'Password is required';
    // if (pass.length < 6) return 'Password must be at least 6 characters';
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
    password.length > 0 &&
    !errors.mobileNumber &&
    !errors.password;

  const handleLogin = async () => {
    if (isButtonEnabled) {
      setLoading(true);
      try {
        const response = await ApiService.login(mobileNumber, password);
        console.log(response, 'loginRes')
        if (response.status === 200 && response.data.length > 0) {
          console.log('Login Success:', response);
          login(response.data[0]);
          navigation.replace('MainApp');
          // navigation.replace('Registration')
        } else if (response.status === 300) {
          // Alert.alert('please wait until verification complete ')
          setAlertMessage('Please wait until verification is complete from Admin');
          setAlertVisible(true);
          setPassword('');
          setMobileNumber('');
        }
        else {
          // Alert.alert("Error", "Invalid credentials");
          setAlertMessage('Invalid credentials');
          setAlertVisible(true);
          // setPassword('');
          // setMobileNumber('');
          // navigation.navigate('MainApp');
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
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Image
        source={require('../assets/foodtrail_delivery.png')}
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

        {/* <TextInput
          style={[styles.input, errors.password && touched.password && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="gray"
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => handleBlur('password')}
        />
        {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null} */}


        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input2,
              { flex: 1 },
              errors.password && touched.password && styles.inputError
            ]}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => handleBlur('password')}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="gray"
              style={{ paddingHorizontal: 8 }}
            />
          </TouchableOpacity>
        </View>
        {touched.password && errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

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

      <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
        <Text style={{ color: '#faa819', marginTop: verticalScale(20) }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    backgroundColor: '#f5f5f5',
    marginBottom: verticalScale(10),
    fontSize: scale(14),
    color: '#000',
  },
  input2: {
    // height: verticalScale(45),
    // borderWidth: 1,
    // borderColor: '#e0e0e0',
    // borderRadius: moderateScale(10),
    // padding: moderateScale(10),
    backgroundColor: '#f5f5f5',
    // marginBottom: verticalScale(10),
    fontSize: scale(14),
    color: '#000',
  },
  inputError: {
    borderColor: 'red',
    backgroundColor: '#fff0f0',
  },
  errorText: {
    color: 'red',
    fontSize: scale(12),
    marginBottom: verticalScale(5),
    padding: moderateScale(5),
    borderRadius: moderateScale(5),
    // backgroundColor: '#ffebee',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#faa819',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#f5f5f5',
    marginBottom: verticalScale(10),
    height: verticalScale(45),
  },

  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: verticalScale(15),
  },
  forgotPasswordText: {
    color: '#faa819',
    fontSize: scale(12),
  },

});

export default LoginScreen;