<?php
/**
 * mavr | iu · puente entre el navegador y Ollama (modelo local)
 *
 * El navegador no habla directamente con Ollama: envía el prompt a este
 * archivo y PHP hace la petición a http://localhost:11434.
 *
 * Entrada (JSON):  { "mensaje": "texto del usuario" }
 * Salida  (JSON):  { "respuesta": "texto generado por el modelo" }
 */

header("Content-Type: application/json; charset=utf-8");

// Modelo instalado en Ollama (ollama pull phi3:mini)
$modelo = "phi3:mini";

// 1. Recoger el JSON enviado desde JavaScript
$entrada = json_decode(file_get_contents("php://input"), true);
$mensaje = trim($entrada["mensaje"] ?? "");

if ($mensaje === "") {
    http_response_code(400);
    echo json_encode(["respuesta" => "El prompt está vacío."]);
    exit;
}

// 2. Preparar la petición para Ollama
$datos = [
    "model"  => $modelo,
    "prompt" => $mensaje,
    "stream" => false
];

// 3. Conectar con Ollama
$ch = curl_init("http://localhost:11434/api/generate");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$respuesta = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

// Si Ollama no está en marcha avisamos al navegador con un error 502
if ($respuesta === false) {
    http_response_code(502);
    echo json_encode(["respuesta" => "No se ha podido conectar con Ollama: $error"]);
    exit;
}

// 4. Quedarnos solo con el texto generado
$resultado = json_decode($respuesta, true);
$texto = $resultado["response"] ?? "No he podido responder.";

// 5. Responder al navegador
echo json_encode(["respuesta" => $texto]);
