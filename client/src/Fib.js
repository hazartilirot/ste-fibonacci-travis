import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Fib = props => {
  
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');
  
  useEffect(() => {
    fetchIndexes();
    fetchValues();
  }, [index])
  
  
  const fetchIndexes = () => {
    axios.get('/api/values/all')
      .then(({ data }) => setSeenIndexes(data))
  }
  
  const fetchValues = () => {
    axios.get('/api/values/current')
      .then(({ data }) => setValues(data))
  }
  
  const handleSubmit = async event => {
    event.preventDefault();
    await axios.post('/api/values', { index })

    setIndex('')
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input 
          type="text"
          value={ index }
          onChange={ e => setIndex(e.target.value) }
        />
        <button>Submit</button>
      </form>
      
      <h3>Indexes I have seen:</h3>
      {seenIndexes.map(({ number }) => number).join(', ')}
      
      <h3>Calculated values:</h3>
        { 
          Object.entries(values).map(([k, v]) => (
            <div key={k}>
              For index {k} I calculated: {v}
            </div>
          ))
        }
    </div>
  );
};
export default Fib;