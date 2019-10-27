import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 1,
    loading: false,
    refreshing: false,
  };

  async componentDidMount() {
    this.load();
  }

  load = async (page = 1) => {
    const { navigation } = this.props;
    const { stars } = this.state;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      loading: false,
      refreshing: false,
      page,
    });
  };

  loadMore = () => {
    const { page } = this.state;

    const nextPage = page + 1;

    this.load(nextPage);
  };

  refreshList = () => {
    this.setState({ refreshing: true, stars: [] }, this.load);
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        <Stars
          data={stars}
          onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
          refreshing={refreshing} // Variável que armazena um estado true/false que representa se a lista está atualizando
          onEndReachedThreshold={0.2}
          onEndReached={this.loadMore}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigate(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
        {loading && <Loading size={50} />}
      </Container>
    );
  }
}
