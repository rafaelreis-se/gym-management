import React from 'react';
import { render, screen } from '@testing-library/react';
import { BeltDisplay } from './BeltDisplay';
import { BeltColor, BeltDegree } from '@gym-management/types';

describe('BeltDisplay', () => {
  it('should render successfully with default props', () => {
    const { container } = render(
      <BeltDisplay beltColor={BeltColor.WHITE} beltDegree={BeltDegree.NONE} />
    );
    expect(container).toBeTruthy();
  });

  it('should display belt label when showLabel is true', () => {
    render(
      <BeltDisplay
        beltColor={BeltColor.BLUE}
        beltDegree={BeltDegree.NONE}
        showLabel={true}
      />
    );
    expect(screen.getByText('Blue Belt')).toBeInTheDocument();
  });

  it('should not display belt label when showLabel is false', () => {
    render(
      <BeltDisplay
        beltColor={BeltColor.BLUE}
        beltDegree={BeltDegree.NONE}
        showLabel={false}
      />
    );
    expect(screen.queryByText('Blue Belt')).not.toBeInTheDocument();
  });

  it('should display degree count in label', () => {
    render(
      <BeltDisplay
        beltColor={BeltColor.PURPLE}
        beltDegree={BeltDegree.DEGREE_2}
        showLabel={true}
      />
    );
    expect(screen.getByText(/Purple Belt/)).toBeInTheDocument();
    expect(screen.getByText(/2 Degrees/)).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { container } = render(
      <BeltDisplay
        beltColor={BeltColor.BROWN}
        beltDegree={BeltDegree.DEGREE_1}
        size="large"
      />
    );
    expect(container).toBeTruthy();
  });

  it('should handle black belt', () => {
    render(
      <BeltDisplay
        beltColor={BeltColor.BLACK}
        beltDegree={BeltDegree.DEGREE_4}
        showLabel={true}
      />
    );
    expect(screen.getByText(/Black Belt/)).toBeInTheDocument();
    expect(screen.getByText(/4 Degrees/)).toBeInTheDocument();
  });

  it('should handle children belts', () => {
    render(
      <BeltDisplay
        beltColor={BeltColor.YELLOW}
        beltDegree={BeltDegree.NONE}
        showLabel={true}
      />
    );
    expect(screen.getByText('Yellow Belt')).toBeInTheDocument();
  });
});
