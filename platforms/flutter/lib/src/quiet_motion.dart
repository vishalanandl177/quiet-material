import 'package:animations/animations.dart' as material_motion;
import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';
import 'quiet_tokens.dart';

/// Canonical MD3 curves for custom animations; native controls retain their specs.
abstract final class QuietCurves {
  static Curve _cubic(List<double> p) => Cubic(p[0], p[1], p[2], p[3]);
  static final Curve standard = _cubic(QuietTokens.easingStandard);
  static final Curve standardAccelerate = _cubic(QuietTokens.easingStandardAccelerate);
  static final Curve standardDecelerate = _cubic(QuietTokens.easingStandardDecelerate);
  static final Curve emphasizedAccelerate = _cubic(QuietTokens.easingEmphasizedAccelerate);
  static final Curve emphasizedDecelerate = _cubic(QuietTokens.easingEmphasizedDecelerate);
  static final Curve linear = _cubic(QuietTokens.easingLinear);
  static const Curve emphasized = _QuietEmphasizedCurve();
}

class _QuietEmphasizedCurve extends Curve {
  const _QuietEmphasizedCurve();
  @override
  double transformInternal(double t) {
    const x = QuietTokens.easingEmphasizedJoinX;
    const y = QuietTokens.easingEmphasizedJoinY;
    if (t <= x) {
      return QuietCurves._cubic(QuietTokens.easingEmphasizedFirst).transform(t / x) * y;
    }
    return y + QuietCurves._cubic(QuietTokens.easingEmphasizedSecond)
        .transform((t - x) / (1 - x)) * (1 - y);
  }
}

enum QuietMotionSpeed { fast, standard, slow }
enum QuietSpringScheme { standard, expressive }

/// Unit-mass MD3 spring configuration. Use effects=true for opacity/color.
SpringDescription quietSpring({
  QuietMotionSpeed speed = QuietMotionSpeed.standard,
  QuietSpringScheme scheme = QuietSpringScheme.standard,
  bool effects = false,
}) {
  final (damping, stiffness) = effects ? switch (speed) {
    QuietMotionSpeed.fast => (QuietTokens.springStandardFastEffectsDamping, QuietTokens.springStandardFastEffectsStiffness),
    QuietMotionSpeed.standard => (QuietTokens.springStandardDefaultEffectsDamping, QuietTokens.springStandardDefaultEffectsStiffness),
    QuietMotionSpeed.slow => (QuietTokens.springStandardSlowEffectsDamping, QuietTokens.springStandardSlowEffectsStiffness),
  } : scheme == QuietSpringScheme.expressive ? switch (speed) {
    QuietMotionSpeed.fast => (QuietTokens.springExpressiveFastSpatialDamping, QuietTokens.springExpressiveFastSpatialStiffness),
    QuietMotionSpeed.standard => (QuietTokens.springExpressiveDefaultSpatialDamping, QuietTokens.springExpressiveDefaultSpatialStiffness),
    QuietMotionSpeed.slow => (QuietTokens.springExpressiveSlowSpatialDamping, QuietTokens.springExpressiveSlowSpatialStiffness),
  } : switch (speed) {
    QuietMotionSpeed.fast => (QuietTokens.springStandardFastSpatialDamping, QuietTokens.springStandardFastSpatialStiffness),
    QuietMotionSpeed.standard => (QuietTokens.springStandardDefaultSpatialDamping, QuietTokens.springStandardDefaultSpatialStiffness),
    QuietMotionSpeed.slow => (QuietTokens.springStandardSlowSpatialDamping, QuietTokens.springStandardSlowSpatialStiffness),
  };
  return SpringDescription.withDampingRatio(mass: 1, stiffness: stiffness, ratio: damping);
}

Duration quietDuration(BuildContext context, {int milliseconds = QuietTokens.durationMedium2}) =>
    MediaQuery.disableAnimationsOf(context) ? Duration.zero : Duration(milliseconds: milliseconds);

enum QuietTransitionPattern { fadeThrough, sharedAxisX, sharedAxisY, sharedAxisZ }

double _unit(double value) => value.clamp(0.0, 1.0).toDouble();

/// MD3 transitions with PageTransitionSwitcher lifecycle management. The child needs
/// a distinct key for each destination. The product owns navigation, state and focus.
class QuietStateChange extends StatelessWidget {
  const QuietStateChange({
    super.key,
    required this.child,
    this.pattern = QuietTransitionPattern.fadeThrough,
    this.reverse = false,
  });
  final Widget child;
  final QuietTransitionPattern pattern;
  final bool reverse;

  @override
  Widget build(BuildContext context) {
    // Direct substitution removes motion and stale outgoing interactive content.
    if (MediaQuery.disableAnimationsOf(context)) return child;
    return material_motion.PageTransitionSwitcher(
      duration: quietDuration(context, milliseconds: pattern == QuietTransitionPattern.fadeThrough
          ? QuietTokens.motionFadeThroughDuration : QuietTokens.motionSharedAxisDuration),
      reverse: reverse,
      transitionBuilder: (child, primary, secondary) {
        // Keep the child tree stable across forward/reverse changes. This uses
        // MD3 token curves, not the package's private legacy easing constants.
        return DualTransitionBuilder(
          animation: primary,
          forwardBuilder: (context, animation, child) => _QuietTransitionFrame(
            animation: animation, incoming: true, backwards: false, pattern: pattern, child: child),
          reverseBuilder: (context, animation, child) => _QuietTransitionFrame(
            animation: animation, incoming: false, backwards: true, pattern: pattern, child: child),
          child: DualTransitionBuilder(
            animation: ReverseAnimation(secondary),
            forwardBuilder: (context, animation, child) => _QuietTransitionFrame(
              animation: animation, incoming: true, backwards: true, pattern: pattern, child: child),
            reverseBuilder: (context, animation, child) => _QuietTransitionFrame(
              animation: animation, incoming: false, backwards: false, pattern: pattern, child: child),
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

class _QuietTransitionFrame extends StatelessWidget {
  const _QuietTransitionFrame({required this.animation, required this.incoming,
    required this.backwards, required this.pattern, this.child});
  final Animation<double> animation;
  final bool incoming;
  final bool backwards;
  final QuietTransitionPattern pattern;
  final Widget? child;

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: animation,
    child: child,
    builder: (context, child) {
      final p = QuietCurves.emphasized.transform(_unit(animation.value));
      const cutoff = 0.35;
      final alpha = incoming ? _unit((p - cutoff) / (1 - cutoff)) : _unit(1 - p / cutoff);
      var scale = 1.0;
      var offset = Offset.zero;
      final direction = backwards ? -1.0 : 1.0;
      switch (pattern) {
        case QuietTransitionPattern.fadeThrough:
          if (incoming) scale = 0.92 + 0.08 * p;
        case QuietTransitionPattern.sharedAxisX:
          final rtl = Directionality.of(context) == TextDirection.rtl ? -1.0 : 1.0;
          offset = Offset(30 * direction * rtl * (incoming ? 1 - p : -p), 0);
        case QuietTransitionPattern.sharedAxisY:
          offset = Offset(0, 30 * direction * (incoming ? 1 - p : -p));
        case QuietTransitionPattern.sharedAxisZ:
          scale = incoming ? (backwards ? 1.1 - 0.1 * p : 0.8 + 0.2 * p)
              : (backwards ? 1 - 0.2 * p : 1 + 0.1 * p);
      }
      return IgnorePointer(
        ignoring: !incoming || alpha == 0,
        child: ExcludeFocus(
          excluding: !incoming || alpha == 0,
          child: ExcludeSemantics(
            excluding: !incoming || alpha == 0,
            child: Opacity(opacity: alpha, child: Transform.translate(
              offset: offset, child: Transform.scale(scale: scale, child: child))),
          ),
        ),
      );
    },
  );
}

/// MD3 fade entry/exit with native route, barrier and focus handling.
Future<T?> showQuietModal<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  bool barrierDismissible = true,
  bool useRootNavigator = true,
}) {
  final reduced = MediaQuery.disableAnimationsOf(context);
  final theme = InheritedTheme.capture(from: context, to: Navigator.of(context, rootNavigator: useRootNavigator).context);
  return Navigator.of(context, rootNavigator: useRootNavigator).push<T>(
    _QuietDialogRoute<T>(
      reduced: reduced,
      barrierDismissible: barrierDismissible,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      pageBuilder: (context, animation, secondary) => SafeArea(child: theme.wrap(Builder(builder: builder))),
    ),
  );
}

class _QuietDialogRoute<T> extends RawDialogRoute<T> {
  _QuietDialogRoute({required bool reduced, required super.pageBuilder,
    required super.barrierDismissible, required super.barrierLabel}) :
    _reduced = reduced,
    super(
      requestFocus: true,
      traversalEdgeBehavior: TraversalEdgeBehavior.closedLoop,
      transitionDuration: Duration(milliseconds: reduced ? 0 : QuietTokens.motionFadeEnterDuration),
      transitionBuilder: (context, animation, secondary, child) {
        if (reduced || MediaQuery.disableAnimationsOf(context)) return child;
        return DualTransitionBuilder(
          animation: animation,
          forwardBuilder: (context, phase, child) => AnimatedBuilder(
            animation: phase, child: child, builder: (context, child) {
              final p = QuietCurves.emphasizedDecelerate.transform(phase.value);
              return Opacity(opacity: _unit(p / 0.3),
                child: Transform.scale(scale: 0.8 + 0.2 * p, child: child));
            },
          ),
          reverseBuilder: (context, phase, child) => AnimatedBuilder(
            animation: phase, child: child, builder: (context, child) => Opacity(
              opacity: 1 - QuietCurves.emphasizedAccelerate.transform(phase.value), child: child),
          ),
          child: child,
        );
      },
    );
  final bool _reduced;
  @override
  Duration get reverseTransitionDuration => Duration(milliseconds: _reduced ? 0 : QuietTokens.motionFadeExitDuration);
}
