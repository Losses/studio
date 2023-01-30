export class LayoutBooster {
  constructor(
    public readonly elementSelector: string,
    public readonly containerSelector: string,
    public readonly gridWidth: number,
    public readonly gap: number
  ) {}

  protected containerLeft = 0;

  protected containerTop = 0;

  protected containerWidth = 0;

  protected cols = 0;

  protected rows = 0;

  protected elementHeights: number[] = [];

  protected rowHeights: number[] = [];

  protected containerScrollTop = 0;

  protected containerScrollLeft = 0;

  updateContainerSize = () => {
    const $container = document.querySelector(this.containerSelector);

    if (!$container) {
      throw new TypeError(`Container not found.`);
    }

    const containerBoundingRect = $container.getBoundingClientRect();

    this.containerLeft = containerBoundingRect.left;
    this.containerTop = containerBoundingRect.top;
    this.containerWidth = containerBoundingRect.width;

    this.cols = Math.floor(this.containerWidth / (this.gridWidth + this.gap));
  };

  handleContainerScroll = () => {
    const $container = document.querySelector(this.containerSelector);

    if (!$container) {
      throw new TypeError(`Container not found.`);
    }

    this.containerScrollTop = $container.scrollTop;

    this.containerScrollLeft = $container.scrollLeft;
  };

  updateElements = () => {
    const $$elements = document.querySelectorAll(this.elementSelector);

    const elementHeights = new Array<number>($$elements.length).fill(0);

    for (let i = 0; i < $$elements.length; i += 1) {
      elementHeights[i] = $$elements[i].clientHeight;
    }

    this.elementHeights = elementHeights;

    this.rows = Math.ceil($$elements.length / this.cols);

    const rowHeights = new Array<number>(this.rows).fill(0);

    for (let i = 0; i < $$elements.length; i += 1) {
      const elementRow = Math.floor(i / this.cols);

      rowHeights[elementRow] = Math.max(
        elementHeights[i],
        rowHeights[elementRow]
      );
    }

    this.rowHeights = rowHeights;
  };

  getFastBoundingClientRect = ($element: HTMLElement | SVGElement) => {
    const elementIndex = Number.parseInt(
      $element.dataset.index ?? 'undefined',
      10
    );

    if (Number.isNaN(elementIndex)) {
      throw new TypeError(`Invalid element.`);
    }

    const elementRow = Math.floor(elementIndex / this.cols);
    const elementCol = elementIndex % this.cols;

    let accumulatedHeight = this.gap;

    for (let i = 0; i < elementRow - 1; i += 1) {
      accumulatedHeight += this.rowHeights[i];
      accumulatedHeight += this.gap;
    }

    return {
      width: this.gridWidth,
      height: this.elementHeights[elementIndex],
      left:
        this.containerLeft -
        this.containerScrollLeft +
        elementCol * (this.gridWidth + this.gap),
      top: this.containerTop - this.containerScrollTop + accumulatedHeight,
    };
  };

  getElementRect = ($element: HTMLElement | SVGElement) => {
    const { width, height, left, top } =
      this.getFastBoundingClientRect($element);

    return {
      pos1: [left, top],
      pos2: [left + width, top],
      pos3: [left, top + height],
      pos4: [left + width, top + height],
    };
  };
}