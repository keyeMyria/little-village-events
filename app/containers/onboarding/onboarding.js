import OnboardingStart from "app/components/onboarding/onboarding-start";
import InterestsPicker from "app/components/onboarding/onboarding-interests-picker";
import InterestsIntro from "app/components/onboarding/onboarding-interests-intro";
import NotificationsIntro from "app/components/onboarding/onboarding-notifications-intro";
import LocationIntro from "app/components/onboarding/onboarding-location-intro";
import LocationPicker from "app/components/onboarding/onboarding-location-picker";

import Swiper from "react-native-swiper";
import { StyleSheet } from "react-native";
import React, { Component } from "react";

import map from "lodash/map";


const styles = StyleSheet.create( {
    root: {
    }
} );


class OnboardingSequence extends Component {

    _swiperRef = React.createRef();
    get swiper() { return this._swiperRef.current; }

    scrollBy = ( n, animate = true ) => {
        const swiperState = this.swiper.state;
        if ( swiperState.index + n < swiperState.total )
            this.swiper.scrollBy( n, animate );
        else
            this.props.effects.finishOnboarding();
    }

    next = () => this.scrollBy( 1 )
    skip = n => this.scrollBy( n, false )


    render() {
        const { state: { userProfile, Categories, Locations, showNotificationsIntro }, effects } = this.props;

        const slides = [
            <OnboardingStart onContinue={ this.next } key="cover" />,
            <InterestsIntro onContinue={ this.next } onSkip={ () => this.skip( 2 ) } key="interestsIntro" />,
            <InterestsPicker
                categories = { Categories }
                selected={ map( userProfile.interests, "id" ) }
                onContinue={ selected => { effects.saveInterests( selected.map( id => ( { id } ) ) ); this.next() } }
                onSkip={ () => this.skip( 1 ) }
                key="interestsPicker"
            />,
            <LocationIntro onContinue={ this.next } onSkip={ () => this.skip( 2 ) } key="locationIntro" />,
            <LocationPicker
                locations = { Locations }
                selected={ userProfile.location.id }
                onContinue={ selected => { effects.saveLocation( { id: selected } ); this.next() } }
                onSkip={ () => this.skip( 1 ) }
                key="LocationPicker"
            />,
            showNotificationsIntro
                ? <NotificationsIntro
                    onContinue={ () => effects.requestNotificationsPermission( this.next ) }
                    onSkip={ () => this.skip( 1 ) }
                    key="notificationsIntro"
                />
                : null
        ].filter( x => !!x );

        return (
            <Swiper ref={ this._swiperRef }
                style={ styles.root }
                loop={ false }
                showsPagination={ false }
                onIndexChanged={ this.updateIndex }
            >
                { slides }
            </Swiper>
        );
    }
}


export default OnboardingSequence;
