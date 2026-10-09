import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: request.headers.get("Authorization") ?? "" } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return json({ error: "Não autenticado" }, 401);

    const { prompt } = await request.json();

    if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > 20000) {
      return json({ error: "Prompt inválido" }, 400);
    }

    const groqKey = Deno.env.get("GROQ_API_KEY");

    if (!groqKey) {
      return json({ error: "GROQ_API_KEY não configurada no servidor" }, 500);
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return json({ error: "Erro na IA", groqStatus: response.status, detail: detail.slice(0, 300) }, 502);
    }

    const data = await response.json();
    return json({ content: data.choices?.[0]?.message?.content ?? "" });
  } catch (e) {
    return json({ error: "Erro interno", detail: String(e) }, 500);
  }
});
