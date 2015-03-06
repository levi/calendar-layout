/**
 * @author Levi McCallum (levi@levimccallum.com)
 * @version 20130115
 */
(function() {
  "use strict";

  /**
   * Alias the environment's global object
   */
  var root = this;

  /**
   * @class Calendar
   */
  var Calendar = root.Calendar = {};

  /**
    Lays out events for a single day

    @param array  events
      An array of event objects. Each event object consists of a start time,
      end time (measured in minutes) from 9am, as well as a unique id. The
      start and end time of each event will be [0, 720]. The start time will
      be less than the end time.  The array is not sorted.

     @return array
      An array of event objects that has the width, the left and top
      positions set, in addition to start time, end time, and id.
  **/
  var layOutDay = Calendar.layOutDay = function(events) {
    var ret = [];

    // Group events into clusters and compute each cluster
    _groupClusters(events).forEach(function(cluster) {
      var columns = [],
          cLen    = cluster.length,
          evt, evtWidth, i;

      // Compute the needed amount of columns and set multiplier
      // on individual events for future left offset calculation
      cluster.forEach(function(evt) {
        var cLen = columns.length,
            interval, i;

        for (i = 0; i < cLen; i++) {
          if (evt.start > columns[i].end) {
            columns[i] = interval = evt;
            evt.left = i;
            break;
          }
        }

        if (!interval) {
          columns.push(evt);
          evt.left = columns.length - 1;
        }
      });

      // Determine event width
      evtWidth = Math.floor(600 / columns.length);

      // Layout final event positioning
      cluster.forEach(function(evt) {
        evt.width = evtWidth;
        evt.left  = evt.left * evtWidth;
        evt.top   = evt.start;
        ret.push(evt);
      });
    });

    return ret;
  };

  /**
   * @private
   *
   * Aggregates event collisions into clusters for processing in layOutDay.
   *
   * @param  array  events
   *   An array of event objects. See `layOutDay` for object requirements.
   * @return array
   *   An array of cluster arrays containing events that
   *   collide with each other.
   */
  var _groupClusters = Calendar._groupClusters = function(events) {
    var ret  = [];

    // Walk through events, accumulating cluster
    function _build(evt, cluster) {
      _build.used || (_build.used = []);
      cluster || (cluster = []);
      for (var i = 0, eLen = events.length; i < eLen; i++) {
        var tmpEvent = events[i];
        // Don't reprocess events
        if (_build.used.indexOf(tmpEvent.id) > -1) continue;

        evt || (evt = tmpEvent);

        if (evt.start <= tmpEvent.end && tmpEvent.start <= evt.end) {
          _build.used.push(tmpEvent.id);
          cluster.push(tmpEvent);
          _build(tmpEvent, cluster);
        }
      }
      return cluster;
    }

    // Build individual clusters
    (function _group() {
      // Sort cluster events by start time, then by length for correct layout
      var sortedCluster = _build().sort(function(a, b) {
        var startSort  = a.start - b.start,
            lengthSort = (a.end - a.start) - (b.end - b.start);
        return startSort !== 0 ? startSort : lengthSort;
      });
      ret.push(sortedCluster);
      // Build a new cluster if events remain unprocessed
      if (_build.used.length !== events.length) _group();
    })();

    return ret;
  };

  /**
   * Render the event blocks of a single day into the DOM.
   *
   * Inserts event DOM elements into the #container element.
   *
   * @param  array events Events to pass into the layOutDay function
   * @return void
   */
  Calendar.render = function(events) {
    var container = document.getElementById('container'),
        frag = [];

    layOutDay(events).forEach(function(evt) {
      var cssProps = {
        left: (evt.left + 10),
        top: evt.top,
        width: evt.width,
        height: (evt.end - evt.top)
      }, styles = [];

      // build dimension css properties
      for (var p in cssProps) {
        if (cssProps.hasOwnProperty(p)) {
          styles.push(p + ': ' + cssProps[p] + 'px;');
        }
      }

      // build string representation of an event element
      frag.push('<div id="event-' + evt.id + '" class="event" ');
        frag.push('style="' + styles.join(" ") + '"');
      frag.push('>');
        frag.push('<h2 title="Sample Event">Sample Event</h2>');
        frag.push('<h3 title="Sample Location">Sample Location</h3>');
      frag.push('</div>');
    });

    container.innerHTML = frag.join('');
  };

  /**
   * Invoke function on DOM ready.
   *
   * Uses DOMContentLoaded as default, but falls back to onload for
   * browsers that do not support the event.
   *
   * @param  Function fn Callback function to invoke when DOM has loaded.
   * @return void
   */
  Calendar.ready = function(fn) {
    if (root.addEventListener) {
      root.addEventListener('DOMContentLoaded', fn, false);
    } else {
      root.attachEvent('onload', fn, false);
    }
  };
}).call(this);