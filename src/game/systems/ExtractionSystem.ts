export interface ExtractionOffer {
  minute: number;

  rewardMultiplier: number;

  holdTime: number;
}

export class ExtractionSystem {
  offers: ExtractionOffer[] = [
    {
      minute: 5,

      rewardMultiplier: 1,

      holdTime: 30000,
    },

    {
      minute: 10,

      rewardMultiplier: 2,

      holdTime: 45000,
    },

    {
      minute: 15,

      rewardMultiplier: 4,

      holdTime: 60000,
    },
  ];

  usedOffers: number[] = [];

  currentOffer: ExtractionOffer | null = null;

  extractionActive: boolean = false;

  extractionCompleted: boolean = false;

  holdProgress: number = 0;

  rewardMultiplier: number = 1;

  private newOfferPending: boolean = false;

  update(elapsedSeconds: number) {
    if (
      this.currentOffer ||
      this.extractionActive ||
      this.extractionCompleted
    ) {
      return;
    }

    const currentMinute = Math.floor(elapsedSeconds / 60);

    for (let i = 0; i < this.offers.length; i++) {
      if (this.usedOffers.includes(i)) {
        continue;
      }

      const offer = this.offers[i];

      if (currentMinute < offer.minute) {
        continue;
      }

      this.currentOffer = offer;

      this.usedOffers.push(i);

      this.newOfferPending = true;

      return;
    }
  }

  consumeNewOffer() {
    if (!this.newOfferPending) {
      return false;
    }

    this.newOfferPending = false;

    return true;
  }

  acceptExtraction() {
    if (!this.currentOffer) {
      return false;
    }

    this.extractionActive = true;

    this.rewardMultiplier = this.currentOffer.rewardMultiplier;

    this.holdProgress = 0;

    return true;
  }

  continueRun() {
    this.currentOffer = null;

    this.extractionActive = false;

    this.holdProgress = 0;
  }

  updateExtraction(delta: number, playerInside: boolean) {
    if (!this.extractionActive || !this.currentOffer) {
      return false;
    }

    if (!playerInside) {
      this.holdProgress = 0;

      return false;
    }

    this.holdProgress += delta;

    if (this.holdProgress < this.currentOffer.holdTime) {
      return false;
    }

    this.extractionCompleted = true;

    this.extractionActive = false;

    return true;
  }

  getHoldSeconds() {
    return Math.floor(this.holdProgress / 1000);
  }

  getRequiredHoldSeconds() {
    if (!this.currentOffer) {
      return 0;
    }

    return Math.floor(this.currentOffer.holdTime / 1000);
  }

  getNextRewardMultiplier() {
    if (!this.currentOffer) {
      return 1;
    }

    return this.currentOffer.rewardMultiplier;
  }

  closeCurrentOffer() {
    this.currentOffer = null;
  }
}
