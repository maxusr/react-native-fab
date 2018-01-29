import React, { Component } from 'react';
import { PanResponder, Button, StyleSheet, Dimensions, Animated, Platform, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
    container: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    containerBottomCenter: {
        top: undefined,
        left: undefined,
        right: undefined,
        alignSelf: "center",
        bottom: 0,
        margin: 'auto',
    },
    containerBottomLeft: {
        top: undefined,
        left: 0,
        right: undefined,
        bottom: 0,
        margin: undefined,
    },
    containerBottomRight: {
        top: undefined,
        left: undefined,
        right: 0,
        bottom: 0,
        margin: undefined,
    },
    containerMiddleLeft: {
        top: 0,
        left: 0,
        right: undefined,
        bottom: 0,
        margin: 'auto',
    },
    containerMiddleRight: {
        top: 0,
        left: undefined,
        right: 0,
        bottom: 0,
        margin: 'auto',
    },
    containerTopCenter: {
        alignSelf: "center",
        top: 0,
        left: undefined,
        right: undefined,
        bottom: undefined,
        margin: 'auto',
    },
    containerTopLeft: {
        top: 0,
        left: 0,
        right: undefined,
        bottom: undefined,
        margin: undefined,
    },
    containerTopRight: {
        top: 0,
        left: undefined,
        right: 0,
        bottom: undefined,
        margin: undefined,
    },
    shadowStyle: {
        shadowOpacity: 0.95,
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowColor: "#000",
        shadowRadius: 1,
        elevation: 3,
        backgroundColor: "transparent"
    },
});

export default class FabActions extends Component {

    static DIRECTIONS = {
        TOP: "top",
        BOTTOM: "bottom"
    };

    constructor(props) {
        super(props);

        this.state = {
            active: props.active,
        };
        this.anim = new Animated.Value(props.active ? 1 : 0);
        this.timeout = 0;
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    componentWillReceiveProps(nextProps) {
        
        if(nextProps.active === false && this.props.active === true) {
            Animated.spring(this.anim, { toValue: 0 }).start(this.setState({active: false}));
        }else if(nextProps.active === true && this.props.active === false) {
            Animated.spring(this.anim, { toValue: 1 }).start(this.setState({active: true}));
        }

        if(nextProps.visible === false) {
            Animated.spring(this.anim, { toValue: 0 }).start(this.setState({active: false}));
        }
    }

    render() {
        let { direction, actions, buttonContent } = this.props;
        

        return (
            <View pointerEvents="box-none" style={[styles.container]} >
                {direction === FabActions.DIRECTIONS.TOP && this._renderActions(this.props.children)}
                {this._renderMainButton(buttonContent)}
                {direction === FabActions.DIRECTIONS.BOTTOM && this._renderActions(this.props.children)}
            </View>
        );
    }

    _renderMainButton(buttonContent) {
        let animatedViewStyle = {
            transform: [
                {
                    scale: this.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, this.props.outRangeScale]
                    })
                }
            ]
        };
        if(this.props.rotateButtonOnToggle) {
            animatedViewStyle.transform.push({
                rotate: this.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", this.props.rotateDegrees + "deg"]
                })
            });
        }

        const wrapperStyle = {
            flex: 0,
            backgroundColor: this.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                    this.props.buttonColor,
                    this.props.buttonOutRange || this.props.buttonColor
                ]
            }),
            width: this.props.buttonSize,
            height: this.props.buttonSize,
            borderRadius: this.props.buttonSize / 2
        };

        const buttonStyle = {
            width: this.props.buttonSize,
            height: this.props.buttonSize,
            borderRadius: this.props.buttonSize / 2,
            alignItems: "center",
            justifyContent: "center"
        };

        const Touchable = this._touchableComponent(this.props.useNativeFeedback);
  
        return (
            this.props.visible ? 
            <Touchable
                testID={this.props.testID}
                background={this._touchableBackground(
                    this.props.nativeFeedbackRippleColor,
                    this.props.fixNativeFeedbackRadius
                )}
                style={{backgroundColor: "transparent"}}
                activeOpacity={this.props.activeOpacity}
                onLongPress={this.props.onLongPress}
                onPress={() => {
                    if(this.props.onPress) this.props.onPress();
                    if (buttonContent) this._animateButton();
                }}
                onPressIn={this.props.onPressIn}
                onPressOut={this.props.onPressOut}
                
            >
                <View style={[buttonStyle]}>
                {this._renderButtonIcon(buttonContent)}
                </View>
            </Touchable>
            : null 
      );
    }

    _animateButton(animate = true) {
        if (this.state.active) return this._reset();

        if (animate) {
            Animated.spring(this.anim, { toValue: 1 }).start();
        } else {
            this.anim.setValue(1);
        }

        this.setState({ active: true });
    }

    _reset(animate = true) {
        if (this.props.onReset) this.props.onReset();

        if (animate) {
            Animated.spring(this.anim, { toValue: 0 }).start();
        } else {
            this.anim.setValue(0);
        }

        setTimeout(
            () => this.setState({ active: false }),
            250
        );
    }

    _renderButtonIcon(buttonContent) {
        const { buttonContentProps } = this.props;
        if (buttonContentProps.isIcon) return <View>{buttonContent}</View>;

        const textColor = buttonContentProps.style.color || "rgba(0,0,0,1)";

        return (
            <Animated.Text
                style={[
                    {backgroundColor: "transparent", fontSize: 20},
                    styles.shadowStyle,
                    buttonContentProps.style,
                    {
                        color: this.anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [textColor, textColor]
                        })
                    }
                ]}
            >
                {buttonContent}
            </Animated.Text>
        );
    }


    _renderActions(actions) {

        if(actions == null) return  null;

        const { direction} = this.props; 

        let animatedViewStyle = {
            marginRight: 0,
            marginBottom: 0,
            transform: [
                {
                    scale: this.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, this.props.outRangeScale]
                    })
                }
            ]
        };
        if(this.props.rotateButtonOnToggle) {
            animatedViewStyle.transform.push({
                rotate: this.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", this.props.rotateDegrees + "deg"]
                })
            });
        }

        if (!this.state.active) return null;

        actions = !Array.isArray(actions) ? [actions] : actions; 

        const actionStyle = {
            backgroundColor: 'purple',
            zIndex: this.props.zIndex
        };

        const actionButtons = [];
        for (let index = 0; index < actions.length; index++) {
            const element = actions[index];
            actionButtons.push(
                <Animated.View key={'fab-button-item-'+index} style={[animatedViewStyle, styles.shadowStyle]}>
                    {element}
                </Animated.View>);
        }

        return (
            <View style={actionStyle} pointerEvents={"box-none"}>
                {actionButtons}
            </View>
        );
    }

    _touchableComponent(useNativeFeedback) {
        /*
        if (useNativeFeedback === true && Platform.OS === "android") {
            return TouchableNativeFeedback;
        }
        */
        return TouchableOpacity;
    }

    _touchableBackground(color, fixRadius) {
        if (Platform.OS === "android") {
            if (Platform["Version"] >= 21) {
                return TouchableNativeFeedback.Ripple(
                    color || "rgba(255,255,255,0.75)",
                    fixRadius
                );
            } else {
                TouchableNativeFeedback.SelectableBackground();
            }
        }
        return undefined;
    }
}

    
FabActions.propTypes = {
    visible: PropTypes.bool,
    active: PropTypes.bool,
    scrollComponent: PropTypes.element,
    buttonContent: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.object]).isRequired,
    direction: PropTypes.oneOf([FabActions.DIRECTIONS.BOTTOM, FabActions.DIRECTIONS.TOP, FabActions.DIRECTIONS.LEFT, FabActions.DIRECTIONS.RIGHT, FabActions.DIRECTIONS.EACHSIDE]),
    buttonColor: PropTypes.string,
    buttonOutRange: PropTypes.string,
    outRangeScale: PropTypes.number,
    rotateDegrees: PropTypes.number,
    rotateButtonOnToggle: PropTypes.bool,
    useNativeFeedback: PropTypes.bool,
    hideShadow: PropTypes.bool,
    shadowStyle: PropTypes.object,
    fixNativeFeedbackRadius: PropTypes.bool,
    nativeFeedbackRippleColor: PropTypes.string,
    activeOpacity: PropTypes.number,
    onPress: PropTypes.func.isRequired,
    onLongPress: PropTypes.func,
    onPressIn: PropTypes.func,
    onPressOut: PropTypes.func,
    buttonContentProps: PropTypes.object,
    spacing: PropTypes.number,
    zIndex: PropTypes.number,
    onReset: PropTypes.func,
};

FabActions.defaultProps = {
    visible: true,
    active: false,
    direction: FabActions.DIRECTIONS.BOTTOM,
    scrollComponent: null,
    buttonColor: "#FFF",
    buttonSize: 48,
    buttonOutRange: null,
    outRangeScale: 1,
    rotateDegrees: 360,
    rotateButtonOnToggle: true,
    useNativeFeedback: true,
    hideShadow: false,
    shadowStyle: {},
    onLongPress: () => {} ,
    onPressIn: () => {},
    onPressOut: () => {},
    buttonContentProps: {
        isIcon: true,
        style: {},
    },
    spacing: 20,
    zIndex: 5,
    onReset: null,
};