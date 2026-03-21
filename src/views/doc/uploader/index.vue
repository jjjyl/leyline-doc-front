<template>
  <div class="page-content">
    <input type="file" ref="fileInput" @change="uploadFile" style="background-color: red"/>
    <button @click="upload" style="background-color: #abb2bf">上传</button>
  </div>
</template>

<script lang="ts">
  import axios from 'axios'
  export default {
    methods: {
      uploadFile() {
        const file = this.$refs.fileInput.files[0];
        this.file = file;
      },
      upload() {
        const formData = new FormData();
        formData.append("file", this.file);

        axios
          .post("https://example.com/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(() => {
            alert("上传成功");
          })
          .catch(() => {
            alert("上传失败");
          });
      },
    },
  };
</script>
