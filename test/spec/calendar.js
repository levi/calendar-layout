describe("Calendar", function() {
  describe("#_buildClusters()", function() {
    it("should identify event cluster and return them in an array sorted by start time and event length", function() {
      // test 1
      var cluster = Calendar._groupClusters([
        { id: 4, start: 610, end: 670 },
        { id: 2, start: 540, end: 600 },
        { id: 1, start: 30, end: 150 },
        { id: 3, start: 570, end: 630 }
      ]);
      expect(cluster).toEqual([
        [
          { id: 2, start: 540, end: 600 },
          { id: 3, start: 570, end: 630 },
          { id: 4, start: 610, end: 670 }
        ],
        [
          { id: 1, start: 30, end: 150 }
        ]
      ]);
    });
  });

  describe('#layOutDay()', function() {

    describe("an event block", function() {
      it("should position its top offset by its start time", function() {
        var events = Calendar.layOutDay([
          { id: 1, start: 60, end: 120 }
        ]);

        expect(events[0].top).toEqual(60);
      });
    });

    describe('a single non-colliding event block', function() {
      var events;

      beforeEach(function() {
        events = Calendar.layOutDay([
          { id: 1, start: 60, end: 120 }
        ]);
      });

      it('should be 600px full-width', function() {
        expect(events[0].width).toEqual(600);
      });

      it('should align completely to the left', function() {
        expect(events[0].left).toEqual(0);
      });
    });

    describe('two colliding start time event blocks', function() {
      var events;

      beforeEach(function() {
        events = Calendar.layOutDay([
          { id: 1, start: 60, end: 120 },
          { id: 2, start: 90, end: 160 }
        ]);
      });

      it('should divide the widths of the event blocks in half', function() {
        expect(events[0].width).toEqual(600 / 2);
      });

      it('should have equal width', function() {
        expect(events[0].width).toEqual(events[1].width);
      });

      it('should offset the left positioning of the second by the width of the first', function() {
        expect(events[1].left).toEqual(events[0].width);
      });
    });

    describe('an event block with a new start time that collides with other events', function() {
      var events;

      beforeEach(function() {
        events = Calendar.layOutDay([
          { id: 1, start: 0, end: 59 },
          { id: 2, start: 0, end: 120 },
          { id: 3, start: 0, end: 160 },
          { id: 4, start: 60, end: 160 }
        ]);
      });

      it("should have a top positioning defined by start time", function() {
        expect(events[3].top).toEqual(60);
      });

      it("should have a left offset of 0", function() {
        expect(events[3].left).toEqual(0);
      });
    });

    describe("event layout #1 -- http://cl.ly/image/31212x0p0O39", function() {
      it("should return a sorted array of correctly positioned events", function() {
        var events = Calendar.layOutDay([
          { id: 5, start: 200, end: 320 },
          { id: 4, start: 130, end: 250 },
          { id: 3, start: 60, end: 360 },
          { id: 7, start: 500, end: 660 },
          { id: 2, start: 20, end: 180 },
          { id: 6, start: 260, end: 420 },
          { id: 1, start: 0, end: 120 },
        ]);

        expect(events).toEqual([
          { id: 1, top: 0, left: 0, width: 200, start: 0, end: 120 },
          { id: 2, top: 20, left: 200, width: 200, start: 20, end: 180 },
          { id: 3, top: 60, left: 400, width: 200, start: 60, end: 360 },
          { id: 4, top: 130, left: 0, width: 200, start: 130, end: 250 },
          { id: 5, top: 200, left: 200, width: 200, start: 200, end: 320 },
          { id: 6, top: 260, left: 0, width: 200, start: 260, end: 420 },
          { id: 7, top: 500, left: 0, width: 600, start: 500, end: 660 }
        ])
      });
    });

    describe("event layout #2 -- http://cl.ly/image/31212x0p0O39", function() {
      it("should return a sorted array of correctly positioned events", function() {
        var events = Calendar.layOutDay([
          { id: 2, start: 540, end: 600 },
          { id: 3, start: 560, end: 620 },
          { id: 4, start: 610, end: 670 },
          { id: 1, start: 30, end: 150 }
        ]);
        expect(events).toEqual([
          { id: 2, start: 540, end: 600, left: 0, width: 300, top: 540 },
          { id: 3, start: 560, end: 620, left: 300, width: 300, top: 560 },
          { id: 4, start: 610, end: 670, left: 0, width: 300, top: 610 },
          { id: 1, start: 30, end: 150,left: 0, width: 600, top: 30 }
        ])
      });
    });
  });
});