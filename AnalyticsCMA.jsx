import { useState } from 'react';
import { api } from '../lib/api';

export default function AnalyticsCMA(){
  const [form,setForm]=useState({ address:'', beds:3, baths:2, sqft:1200 });
  const [res,setRes]=useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">AI CMA & Predictions</h1>
      <div className="grid gap-2 my-4">
        {['address','beds','baths','sqft'].map(k=> (
          <input
            key={k}
            className="border p-2"
            placeholder={k}
            value={form[k]}
            onChange={e=>setForm({...form, [k]: e.target.value})}
          />
        ))}
        <button
          className="btn"
          onClick={async()=>setRes(await api.cma(form))}
        >
          Run CMA
        </button>
      </div>
      {res && (
        <pre className="bg-gray-50 p-4 rounded max-h-96 overflow-auto">
          {JSON.stringify(res,null,2)}
        </pre>
      )}
    </div>
  );
}
