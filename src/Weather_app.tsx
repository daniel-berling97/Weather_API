import React, { useState } from 'react';
import './Styles_responsive.css';

function Weather_app() {
  const [city, setCity] = useState('');

  type HGWeatherResponse = {
    city?: string;
    temp?: number;
    forecast?: Array<{ max?: number; min?: number; [key: string]: unknown }>;
    [key: string]: unknown;
  };

  // dados retornados pela API (cidade, previsão)
  const [data, setData] = useState<HGWeatherResponse | null>(null);
  // flag enquanto a requisição está em curso
  const [loading, setLoading] = useState(false);
  // mensagem de erro para exibição ao usuário
  const [error, setError] = useState<string | null>(null);

  // chave secreta da API via variável de ambiente
  const apiKey = import.meta.env.VITE_API_KEY;

  const fetchWeather = async (q: string) => {
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const url = `/api/weather?key=${apiKey}&city_name=${encodeURIComponent(q)}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.results) {
        const cityReturned = (json.results.city || '').toLowerCase().trim();
        const citySearched = q.toLowerCase().trim();
        const searchParts = citySearched.split(',').map(s => s.trim());
        const mainCity = searchParts[0];

        const isExactMatch = cityReturned === citySearched;
        const isMainCityMatch = cityReturned.includes(mainCity) || mainCity.includes(cityReturned.split(',')[0]);

        if (!isExactMatch && !isMainCityMatch && cityReturned === 'são paulo') {
          throw new Error(`Cidade "${q}" não encontrada. A API retornou: "${json.results.city}"`);
        }

        setData(json.results);
      } else {
        throw new Error('Cidade não encontrada ou resposta inválida');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Erro ao buscar dados');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    fetchWeather(city.trim());
  };

  // Permite buscar ao pressionar Enter
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  // estrutura visual principal da aplicação
  return (
    <>
      <main>
        <div className='container'>
          <hgroup>
            <h1>Clima Brasil</h1>
            <p>Saiba sobre a temperatura atual da sua cidade ou região.</p>
            <hr/>
          </hgroup>
          <div className='searcher-city'>
            <input
              type='text'
              placeholder='Procurar cidades'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              className='btn'
              onClick={onSearch}
              disabled={!city.trim() || loading}
            >
              {loading ? 'Buscando...' : 'Pesquisar'}
            </button>
          </div>

          <div className='error-info-city'>
            {error && <p className='error-info'>erro: {error}</p>}
            <h2>{data?.city ?? '--'}</h2>
          </div>

          <div className='weather-data'>
            <div className='info'>
              <p>Temp. Max:</p>
              <span className='info-data'>{data?.forecast ? data.forecast[0]?.max ?? '--' : '--'}°C</span>
            </div>
            <div className='info'>
              <p>Temp. Min:</p>
              <span className='info-data'>{data?.forecast ? data.forecast[0]?.min ?? '--' : '--'}°C</span>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; Copyright 2025 by Sr.Darkin</p>
      </footer>
    </>
  );
}

export default Weather_app;
