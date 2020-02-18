const supportedAudioFormats = (() => {
  const formats = [
    "audio/mpeg;",
    'audio/wav; codecs="1"',
    'audio/mp4; codecs="mp4a.40.2"',
    'audio/webm; codecs="vorbis"',
    'audio/ogg; codecs="vorbis"',
    'audio/ogg; codecs="opus"'
  ];
  const valid = ["maybe", "probably"];
  const audio = new Audio();
  const supports = format => valid.includes(audio.canPlayType(format));

  return () => formats.filter(supports);
})();

const supportAudioFormat = (() => {
  const supported = supportedAudioFormats();

  return format => supported.includes(format);
})();

export const youtubeVideoInfo = (() => {
  const proxy = "https://focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=";
  const endpoint = "https://www.youtube.com/get_video_info?video_id=";
  const url = videoId =>
    [proxy, encodeURIComponent(endpoint), encodeURIComponent(videoId)].join("");
  const extract = response => (response.ok ? response.text() : Promise.reject(response));
  const parse = params => JSON.parse(new URLSearchParams(params).get("player_response"));

  return videoId =>
    fetch(url(videoId))
      .then(extract)
      .then(parse);
})();

export const youtubeAudioStreams = (() => {
  const supportedAudioStream = ({ mimeType }) => supportAudioFormat(mimeType);
  const parse = cipher => new URLSearchParams(cipher).get("url");
  const getUrl = stream => (stream.url ? stream : { ...stream, url: parse(stream.cipher) });
  return ({ streamingData: { adaptiveFormats: streams } }) =>
    streams
      .filter(supportedAudioStream)
      .map(data => {
        data.cipher && console.log(Array.from(new URLSearchParams(data.cipher).entries()));
        return data;
      })
      .map(getUrl);
})();

// // Fetch the video meta data
// $url = 'http://www.youtube.com/get_video_info?video_id=V1NW91yW6MA&asv=3&el=detailpage&hl=en_US';
// $data = file_get_contents($url);

// // Extract the meta data to an array
// $video_info = array();
// parse_str($data, $video_info);

// // Decode and split up the storyboard specs
// $spec_parts = urldecode($video_info['storyboard_spec']);
// $spec_parts = explode('|', $spec_parts);

// // Extract and build the base URL
// $base_url = explode('$', $spec_parts[0]);
// $base_url = $base_url[0] . '2/M';

// // Extract the sigh parameter
// $sigh = explode('#', $spec_parts[3]);
// $sigh = array_pop($sigh);

// // Find the number of images
// if($video_info['length_seconds'] >= 1200) {
//     $count = $video_info['length_seconds'] / 240;
// } else {
//     $count = 5;
// }

// // Build the URL list
// $urls = array();
// for($i = 0; $i < $count; $i += 1){
//     $urls[] = $base_url . $i . '.jpg?sigh=' . $sigh;
// }
