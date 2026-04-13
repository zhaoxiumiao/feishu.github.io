<script setup>
import { useRouter } from "vue-router";
</script>

<template>
  <main>
    <h3>Click Link</h3>
    <h4>
      <a
        href="https://primedrama.go.link?adj_t=1z58ee37&adj_campaign={campaignId}&adj_adgroup={tagId}&adj_creative={adId}&adj_gps_adid={gaid}&adj_xiaomi_global_ext={ext}&adj_xiaomi_global_clickid={triggerId}&adj_deep_link=primedramacc%3A%2F%2F%3Ftheatre_id%3D862&adj_redirect=mimarket%3A%2F%2Fdetails%3Fid%3Dcom.yg.extreme.moto"
        >Link Here</a
      >
    </h4>
  </main>
</template>

<style scoped>
main {
  padding: 1rem;
}
h4 {
  font-size: calc(1.275rem + 0.3vw);
  margin-bottom: 1rem;
}
h4:nth-of-type(2) {
  margin-top: 1rem;
}
code {
  font-size: 0.875em;
  color: #d63384;
  word-wrap: break-word;
}
</style>
