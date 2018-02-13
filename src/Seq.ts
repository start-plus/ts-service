export class Seq {
  private id = 0;

  getNext() {
    return ++this.id;
  }

  reset() {
    this.id = 0;
  }
}
