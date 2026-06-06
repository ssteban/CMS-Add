import { useState } from 'react';
import { ChevronDown, Code, Copy, Check } from 'lucide-react';
import { API_BASE } from '../config';

const technologies = [
  { id: 'python', label: 'Python (requests)' },
  { id: 'js-fetch', label: 'JavaScript (Fetch)' },
  { id: 'js-axios', label: 'JavaScript (Axios)' },
  { id: 'curl', label: 'cURL' },
  { id: 'php', label: 'PHP' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'java', label: 'Java (OkHttp)' },
  { id: 'swift', label: 'Swift' },
];

function buildPython(url: string): string {
  return `import requests

API_KEY = "tu_api_key_aqui"
url = "${url}/api/v1/public/content"

response = requests.get(url, params={"api_key": API_KEY})
data = response.json()

print(data)`;
}

function buildJsFetch(url: string): string {
  return `const API_KEY = "tu_api_key_aqui";
const url = "${url}/api/v1/public/content?api_key=" + API_KEY;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
}

function buildJsAxios(url: string): string {
  return `import axios from 'axios';

const API_KEY = "tu_api_key_aqui";
const url = "${url}/api/v1/public/content";

axios.get(url, { params: { api_key: API_KEY } })
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`;
}

function buildCurl(url: string): string {
  return `curl "${url}/api/v1/public/content?api_key=tu_api_key_aqui"`;
}

function buildPhp(url: string): string {
  return `<?php
$apiKey = "tu_api_key_aqui";
$url = "${url}/api/v1/public/content?api_key=" . $apiKey;

$response = file_get_contents($url);
$data = json_decode($response, true);
print_r($data);`;
}

function buildRuby(url: string): string {
  return `require 'net/http'
require 'json'

api_key = "tu_api_key_aqui"
url = URI("${url}/api/v1/public/content")
url.query = URI.encode_www_form({ api_key: api_key })

response = Net::HTTP.get(url)
data = JSON.parse(response)
puts data`;
}

function buildGo(url: string): string {
  return `package main

import (
\t"fmt"
\t"io/ioutil"
\t"net/http"
)

func main() {
\tapiKey := "tu_api_key_aqui"
\turl := fmt.Sprintf("${url}/api/v1/public/content?api_key=%s", apiKey)

\tresp, _ := http.Get(url)
\tbody, _ := ioutil.ReadAll(resp.Body)
\tdefer resp.Body.Close()

\tfmt.Println(string(body))
}`;
}

function buildRust(url: string): string {
  return `use reqwest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_key = "tu_api_key_aqui";
    let url = format!("${url}/api/v1/public/content?api_key={}", api_key);

    let client = reqwest::Client::new();
    let resp = client.get(&url).send().await?;
    let body = resp.text().await?;

    println!("{}", body);
    Ok(())
}`;
}

function buildJava(url: string): string {
  return `import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class Main {
    public static void main(String[] args) throws Exception {
        String apiKey = "tu_api_key_aqui";
        String url = "${url}/api/v1/public/content?api_key=" + apiKey;

        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder().url(url).build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.body().string());
        }
    }
}`;
}

function buildSwift(url: string): string {
  return `import Foundation

let apiKey = "tu_api_key_aqui"
let urlString = "${url}/api/v1/public/content?api_key=\\(apiKey)"

if let url = URL(string: urlString) {
    URLSession.shared.dataTask(with: url) { data, _, error in
        if let data = data {
            print(String(data: data, encoding: .utf8)!)
        }
    }.resume()
}`;
}

const codeBuilders: Record<string, (url: string) => string> = {
  'python': buildPython,
  'js-fetch': buildJsFetch,
  'js-axios': buildJsAxios,
  'curl': buildCurl,
  'php': buildPhp,
  'ruby': buildRuby,
  'go': buildGo,
  'rust': buildRust,
  'java': buildJava,
  'swift': buildSwift,
};

const Uso = () => {
  const [openId, setOpenId] = useState<string>('python');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(prev => prev === id ? '' : id);
  };

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
            <Code size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">¿Cómo usar tu contenido?</h1>
        </div>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          Una vez que hayas creado y publicado tu JSON, puedes consumirlo desde cualquier
          lenguaje o framework. Solo necesitas tu <strong>API Key</strong> y hacer una
          petición GET al endpoint público.
        </p>
      </div>

      <div className="space-y-3">
        {technologies.map(tech => {
          const isOpen = openId === tech.id;
          const code = codeBuilders[tech.id](API_BASE);
          const isCopied = copiedId === tech.id;

          return (
            <div
              key={tech.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <button
                onClick={() => toggle(tech.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900">{tech.label}</span>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 animate-in slide-in-from-top-1 duration-200">
                  <div className="relative group">
                    <pre className="bg-slate-900 text-emerald-300 p-5 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre">
                      <code>{code}</code>
                    </pre>
                    <button
                      onClick={() => handleCopy(tech.id, code)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Copiar código"
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-bold text-slate-900 mb-2">Nota sobre el endpoint</h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          El endpoint público <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-mono text-xs">GET /api/v1/public/content</code>{' '}
          devuelve exactamente el JSON que publicaste, sin ningún wrapper. La respuesta
          será un objeto JSON plano con la estructura que definiste en el editor.
          Puedes probarlo con el botón <strong>"Probar"</strong> dentro del editor.
        </p>
      </div>
    </div>
  );
};

export default Uso;
