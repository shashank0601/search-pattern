<template>
  <div class='about'>
    <div class='background absolute' @click.prevent='close'></div>
    <div class='content'>
      <h3>Google extended Search<a class='close bold highlight' href='#' @click.prevent='close'>close</a></h3>
      <p>
        Have you ever noticed how Google auto-completes your queries? Like so:
        <img src="https://i.imgur.com/Dz0crfG.gif" alt="google auto complete demo" width='300px'>
      </p>
      <p>What if we repeat the same query for every suggestion? We will get a bigger picture:</p>
      <img src="https://i.imgur.com/aqzfpBJ.png" alt="Bigger picture with all searches" width='300px'>
      
      <p>Now let's repeat this process one more time for every found suggestion. But instead of
        drawing a picture, let's draw a line between each suggestion:</p>
        <img src="https://i.imgur.com/OBbEJP7.png" alt="suggestions graph" width="300px">

      <p>And this is exactly what this website is doing for You.</p>
      <p>I found this technique useful to find alternatives, or to perform a market research.
        Obviously, for this technique to work, Google needs to know enough about your query.
      </p>
      
    </div>
  </div>
</template>
<script>

export default {
  mounted() {
    this.closeHandler = (e) => {
      if (e.keyCode === 27) {
        e.preventDefault();
        this.close();
      }
    }
    document.addEventListener('keyup', this.closeHandler);
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.closeHandler);
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style lang='stylus'>
.about {
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;

  .close {
    position: absolute;
    right: 15px;
    font-size: 12px;
  }

  .large-close {
    width: 100%;
    height: 32px;
    display: block;
    text-align: center;
  }

  .content {
    overflow-y: auto;
    max-height: 100%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 -1px 0px rgba(0,0,0,0.02);
    position: absolute;
    background-color: white;
    width: 400px;
    padding: 14px;
    border: 1px solid #58585A;
    h3 {
      margin: 0;
      font-weight: normal;
    }
  }
}


.background {
  position: absolute;
  background-color: #58585A;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 800px) {
  .about {
    justify-content: initial;
  }
  .about .content {
    width: 100%;
    border: none;
  }
}
</style>
