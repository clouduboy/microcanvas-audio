const synth = {
  sampleRate: 4,
  sampleRes: 8
}

fetch('assets/bgm1.raw').then(r=>r.arrayBuffer()).then(r=>new Uint8Array(r)).then(raw => {
  console.log(`Raw length: ${raw.length} bytes`)
  const envelopeFullLength = raw.length
  const data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
  data.set(raw, 44)
  let used = envelopeFullLength



  var dv = new Uint32Array(data.buffer, 0, 44); // header data view

  // Initialize header
  dv[0] = 0x46464952; // "RIFF"
  dv[1] = used + 36;  // put total size here
  dv[2] = 0x45564157; // "WAVE"
  dv[3] = 0x20746D66; // "fmt "
  dv[4] = 0x00000010; // size of the following
  dv[5] = 0x00010001; // Mono: 1 channel, PCM format
  dv[6] = 0x00002B11 * (5-synth.sampleRate); // 11,025 samples per second
  dv[7] = 0x00005622 * (5-synth.sampleRate); // byte rate: two bytes per sample
  dv[8] = synth.sampleRes>>3 | synth.sampleRes<<16; // 8 or 16 bits per sample, aligned on every two bytes
  dv[9] = 0x61746164; // "data"
  dv[10] = used;      // put number of samples here

  // Base64 encoding written by me, @maettig
  used += 44;
  var i = 0,
      base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = 'data:audio/wav;base64,';
  for (; i < used; i += 3)
  {
    var a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
    output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
  }

  console.log(output)
  document.body.insertAdjacentHTML('beforeend', `<audio preload="auto" src="${output}" style="width: 300px;height: 32px; display: inline-block; background: gray;"></audio>`)
  setTimeout(_ => {
    let audioElement = document.querySelector('audio')
    audioElement.onclick = (e) => {
      console.log(`Play - total duration: ${audioElement.duration}s`)
      audioElement.play()
    }

    console.log(audioElement)
  }, 1)
})
