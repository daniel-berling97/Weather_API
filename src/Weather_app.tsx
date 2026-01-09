import React, { useState } from 'react';
import './Styles_responsive.css';

function Weather_app() {
  // Estado para armazenar a cidade digitada pelo usuário
  const [city, setCity] = useState('');
  
  // Tipo da resposta da API de clima
  type HGWeatherResponse = {
    city?: string;
    temp?: number;
    forecast?: Array<{ max?: number; min?: number; [key: string]: unknown }>;
    [key: string]: unknown;
  };

  // Estados da aplicação
  const [data, setData] = useState<HGWeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chave da API carregada do arquivo .env
  const apiKey = import.meta.env.VITE_API_KEY;

  const fetchWeather = async (q: string) => {
    // Valida se há texto para buscar
    if (!q) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Faz requisição à API de clima com a cidade digitada
      const url = `/api/weather?key=${apiKey}&city_name=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      // Processa resposta e valida se a cidade retornada corresponde à buscada
      if (json.results) {
        const cityReturned = (json.results.city || '').toLowerCase().trim();
        const citySearched = q.toLowerCase().trim();
        const searchParts = citySearched.split(',').map(s => s.trim());
        const mainCity = searchParts[0];
        
        // Verifica se há correspondência exata ou parcial
        const isExactMatch = cityReturned === citySearched;
        const isMainCityMatch = cityReturned.includes(mainCity) || mainCity.includes(cityReturned.split(',')[0]);
        
        // Lança erro se a API retornar apenas o fallback (São Paulo)
        if (!isExactMatch && !isMainCityMatch && cityReturned === 'são paulo') {
          throw new Error(`Cidade "${q}" não encontrada. A API retornou: "${json.results.city}"`);
        }
        
        setData(json.results);
      } else {
        throw new Error('Cidade não encontrada ou resposta inválida');
      }
    } catch (e: unknown) {
      // Trata erro e atualiza estado
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
            {/* Campo de entrada e botão de busca */}
            <input
            type='text'
            placeholder='Procurar cidades'
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={onKeyDown}></input><button className='btn'
                                                  onClick={onSearch}
                                                  disabled={!city.trim() || loading}>
                                                    {loading ? 'Buscando...' : 'Pesquisar'}</button>
          </div>
           <div className='error-info-city'>
            <br/>
           {error && <><p className='error-info'>erro:</p><br/></>}
           {/* Exibe a cidade buscada ou placeholders */}
           <h2>{data?.city ?? '--'}</h2>
          </div>
          {/* Exibe temperaturas máxima e mínima */}
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
