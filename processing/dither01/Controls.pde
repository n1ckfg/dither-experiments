void keyPressed() {
  switch(key) {
    case '1':
      setupSpecs("gameboy");
      break;
    case '2':
      setupSpecs("pixelvision");
      break;
    case '3':
      setupSpecs("vhs-c");
      break;
    case '4':
      setupSpecs("hypercard");
      break;
    case '5':
      setupSpecs("film");
      break;
    case 'p':
      preview = !preview;
      break;
    case 'b':
      useBorders = !useBorders;
      break;
    case 't':
      useTv = !useTv;
      break;
    case 'd':
      doDither = !doDither;
      break;
  }
}
