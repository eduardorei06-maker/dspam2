
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Platform, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sabrinaPhotos = [
  require('./assets/1.jpg'),
  require('./assets/2.jpg'),
  require('./assets/3.jpg'),
  require('./assets/4.jpg'),
  require('./assets/5.jpg'),
  require('./assets/6.jpg'),
  require('./assets/7.jpg'),
  require('./assets/8.jpg'),
  require('./assets/9.jpg'),
  require('./assets/10.jpg'),
  require('./assets/11.jpg'),
  require('./assets/12.jpg'),
  require('./assets/13.jpg'),
  require('./assets/14.jpg'),

];

export default function App() {
  const [cep, setCep] = useState('');
  const [cepData, setCepData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [randomPhoto, setRandomPhoto] = useState(null);

  const handleSaveManual = async () => {
    if (!cepData?.logradouro || !cepData?.bairro || !cepData?.localidade || !cepData?.uf) {
      setError('Por favor, preencha rua, bairro, cidade e UF.');
      return;
    }
    setError('');
    const finalData = { ...cepData, isManual: false };
    setCepData(finalData);

    try {
      let cleanCep = cep.replace(/\D/g, '');
      await AsyncStorage.setItem(`@cep_${cleanCep}`, JSON.stringify(finalData));
    } catch (e) {
      console.log('Erro ao salvar o CEP no storage:', e);
    }
  };

  const buscarCep = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      setError('Por favor, digite um CEP válido com 8 números.');
      setCepData(null);
      return;
    }

    Keyboard.dismiss();
    setError('');
    setLoading(true);
    setCepData(null);
    setRandomPhoto(null);

    let cleanCep = cep.replace(/\D/g, '');

    try {
      const savedCepInfo = await AsyncStorage.getItem(`@cep_${cleanCep}`);
      if (savedCepInfo !== null) {
        setCepData(JSON.parse(savedCepInfo));
        setRandomPhoto(sabrinaPhotos[Math.floor(Math.random() * sabrinaPhotos.length)]);
        setLoading(false);
        return; // Retorna pois encontrou salvo localmente
      }
    } catch (e) {
      console.log('Erro ao ler CEP do storage:', e);
    }

    let url = `https://viacep.com.br/ws/${cleanCep}/json/`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.erro) {
          setError('Ops! CEP não encontrado, angel. Por favor, insira os dados abaixo:');
          setCepData({ logradouro: '', bairro: '', localidade: '', uf: '', complemento: '', isManual: true });
          setRandomPhoto(sabrinaPhotos[Math.floor(Math.random() * sabrinaPhotos.length)]);
        } else {
          setCepData(data);
          setRandomPhoto(sabrinaPhotos[Math.floor(Math.random() * sabrinaPhotos.length)]);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError('Ocorreu um erro ao buscar o CEP.');
        console.error('Erro:', error);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={Platform.OS === 'web'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#cae6f2' }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <StatusBar style="dark" />

          <View style={styles.header}>
            <Text style={styles.title}>Short n' Sweet</Text>
            <Text style={styles.subtitle}>Espresso CEP Delivery ☕</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite o CEP..."
              placeholderTextColor="#ff8fab"
              keyboardType="numeric"
              value={cep}
              onChangeText={setCep}
              maxLength={9}
            />
            <TouchableOpacity style={styles.button} onPress={buscarCep}>
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading && <ActivityIndicator size="large" color="#e63946" style={{ marginTop: 20 }} />}

          {cepData && !loading && (
            <View style={styles.card}>
              {randomPhoto && (
                <Image source={randomPhoto} style={styles.photo} />
              )}
              <Text style={styles.cardTitle}>Please Please Please</Text>
              <Text style={styles.cardInfo}>entregue neste endereço:</Text>
              <View style={styles.cardContent}>
                <Text style={styles.label}>Logradouro:</Text>
                {cepData.isManual ? (
                  <TextInput
                    style={styles.manualInput}
                    placeholder="Digite a rua/avenida"
                    placeholderTextColor="#ffb3c6"
                    value={cepData.logradouro}
                    onChangeText={(text) => setCepData({ ...cepData, logradouro: text })}
                  />
                ) : (
                  <Text style={styles.value}>{cepData.logradouro || 'N/A'}</Text>
                )}

                <Text style={styles.label}>Bairro:</Text>
                {cepData.isManual ? (
                  <TextInput
                    style={styles.manualInput}
                    placeholder="Digite o bairro"
                    placeholderTextColor="#ffb3c6"
                    value={cepData.bairro}
                    onChangeText={(text) => setCepData({ ...cepData, bairro: text })}
                  />
                ) : (
                  <Text style={styles.value}>{cepData.bairro || 'N/A'}</Text>
                )}

                <Text style={styles.label}>Cidade / UF:</Text>
                {cepData.isManual ? (
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput
                      style={[styles.manualInput, { flex: 0.7, marginRight: 10 }]}
                      placeholder="Cidade"
                      placeholderTextColor="#ffb3c6"
                      value={cepData.localidade}
                      onChangeText={(text) => setCepData({ ...cepData, localidade: text })}
                    />
                    <TextInput
                      style={[styles.manualInput, { flex: 0.3 }]}
                      placeholder="UF"
                      placeholderTextColor="#ffb3c6"
                      value={cepData.uf}
                      onChangeText={(text) => setCepData({ ...cepData, uf: text })}
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                ) : (
                  <Text style={styles.value}>{cepData.localidade} - {cepData.uf}</Text>
                )}

                {cepData.complemento || cepData.isManual ? (
                  <>
                    <Text style={styles.label}>Complemento:</Text>
                    {cepData.isManual ? (
                      <TextInput
                        style={styles.manualInput}
                        placeholder="Opicional"
                        placeholderTextColor="#ffb3c6"
                        value={cepData.complemento}
                        onChangeText={(text) => setCepData({ ...cepData, complemento: text })}
                      />
                    ) : (
                      <Text style={styles.value}>{cepData.complemento}</Text>
                    )}
                  </>
                ) : null}
              </View>
              {cepData.isManual && (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveManual}>
                  <Text style={styles.saveButtonText}>Salvar Endereço</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.footerText}>xoxo, Sabrina 💋</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#e63946', // Vibrant red / lip color
    fontStyle: 'italic',
    textShadowColor: 'rgba(230, 57, 70, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#d62828',
    fontWeight: '600',
    marginTop: 5,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 55,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#d62828',
    borderWidth: 2,
    borderColor: '#ffc2d1',
    borderRightWidth: 0,
  },
  button: {
    backgroundColor: '#ffb3c6',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: '#ffc2d1',
    borderLeftWidth: 0,
  },
  buttonText: {
    color: '#e63946',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#e63946',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#ffc2d1',
    shadowColor: '#ffb3c6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ffc2d1',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e63946',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardInfo: {
    fontSize: 14,
    color: '#ff8fab',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  cardContent: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#ff8fab',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#d62828',
    fontWeight: '600',
    marginBottom: 5,
  },
  manualInput: {
    fontSize: 16,
    color: '#d62828',
    backgroundColor: '#fff0f3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ffc2d1',
    marginBottom: 10,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'right',
    color: '#e63946',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 16,
    marginTop: 10,
  }
});
