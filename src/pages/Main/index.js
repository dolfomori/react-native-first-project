import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import { Keyboard, ActivityIndicator } from 'react-native';

// import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  Text,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  Delete,
  TextDelete,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    error: false,
    loading: false,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  deleteUser = user => {
    const { users } = this.state;

    const data = users.filter(item => item.login !== user);

    this.setState({ users: data });
  };

  handleAddUser = async () => {
    // console.tron.log(this.state.newUser);
    const { newUser, users, error } = this.state;

    this.setState({ loading: true, error: false });

    try {
      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      const userExist = users.find(u => u.login === data.login);

      if (userExist) throw Error('User is already registred');

      this.setState({
        users: [...users, data],
        newUser: '',
      });

      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  render() {
    const { users, newUser, loading, error } = this.state;

    return (
      <Container>
        <Form>
          <Input
            error={error}
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar Usuários"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text>+</Text>}
            {/* <Icon name="add" size={20} color="#Eee" /> */}
          </SubmitButton>
        </Form>
        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Delete onPress={() => this.deleteUser(item.login)}>
                <TextDelete> X </TextDelete>
              </Delete>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver Perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
